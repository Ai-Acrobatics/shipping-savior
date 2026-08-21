import { describe, it, expect, vi, afterEach } from "vitest";
import {
  AisHubProvider,
  HttpAisProvider,
  NullAisProvider,
  dropStalePositions,
  getAisProvider,
} from "./provider";
import type { AisPosition } from "./types";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("getAisProvider", () => {
  it("defaults to the null provider", () => {
    expect(getAisProvider({}).id).toBe("none");
    expect(getAisProvider({ AIS_PROVIDER: "none" }).id).toBe("none");
  });

  it("returns AISHub when a username is configured", () => {
    const provider = getAisProvider({
      AIS_PROVIDER: "aishub",
      AISHUB_USERNAME: "acme",
    });
    expect(provider).toBeInstanceOf(AisHubProvider);
  });

  it("fails closed to none when AISHub credentials are missing", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(getAisProvider({ AIS_PROVIDER: "aishub" }).id).toBe("none");
  });

  it("returns the HTTP provider when a URL is configured", () => {
    const provider = getAisProvider({
      AIS_PROVIDER: "http",
      AIS_API_URL: "https://example.test/ais",
    });
    expect(provider).toBeInstanceOf(HttpAisProvider);
  });

  it("fails closed to none when the HTTP URL is missing", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(getAisProvider({ AIS_PROVIDER: "http" }).id).toBe("none");
  });

  it("fails closed on an unknown provider name", () => {
    expect(getAisProvider({ AIS_PROVIDER: "nonsense" }).id).toBe("none");
  });
});

describe("NullAisProvider", () => {
  it("returns no positions", async () => {
    await expect(new NullAisProvider().fetchPositions()).resolves.toEqual([]);
  });
});

describe("HttpAisProvider", () => {
  it("substitutes the {vessels} placeholder and sends a bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ name: "MSC OSCAR", lat: 1, lng: 2 }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = new HttpAisProvider(
      "https://example.test/ais?names={vessels}",
      "secret",
      "Authorization"
    );
    const positions = await provider.fetchPositions([{ name: "MSC OSCAR" }]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.test/ais?names=MSC%20OSCAR");
    expect(init.headers.Authorization).toBe("Bearer secret");
    expect(positions).toHaveLength(1);
  });

  it("sends the raw key for a non-Authorization header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);

    await new HttpAisProvider("https://example.test/ais", "secret", "X-Api-Key").fetchPositions([]);
    expect(fetchMock.mock.calls[0][1].headers["X-Api-Key"]).toBe("secret");
  });

  it("resolves to [] on a non-OK response instead of throwing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(
      new HttpAisProvider("https://example.test/ais", null, "Authorization").fetchPositions([])
    ).resolves.toEqual([]);
  });

  it("resolves to [] when the request throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNRESET")));
    await expect(
      new HttpAisProvider("https://example.test/ais", null, "Authorization").fetchPositions([])
    ).resolves.toEqual([]);
  });
});

describe("AisHubProvider", () => {
  it("calls the AISHub JSON endpoint and normalizes the envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ ERROR: false }, [{ MMSI: 1, NAME: "MSC OSCAR", LATITUDE: 10, LONGITUDE: 20 }]],
    });
    vi.stubGlobal("fetch", fetchMock);

    const positions = await new AisHubProvider("acme").fetchPositions([]);
    expect(fetchMock.mock.calls[0][0]).toContain("username=acme");
    expect(positions[0].name).toBe("MSC OSCAR");
  });
});

describe("dropStalePositions", () => {
  const pos = (timestamp: string | null): AisPosition => ({
    name: "X",
    lat: 1,
    lng: 2,
    timestamp,
    source: "http",
  });

  const now = Date.parse("2026-08-20T12:00:00.000Z");

  it("keeps recent fixes", () => {
    expect(dropStalePositions([pos("2026-08-20T10:00:00.000Z")], now)).toHaveLength(1);
  });

  it("drops fixes older than the max age", () => {
    expect(dropStalePositions([pos("2026-08-18T10:00:00.000Z")], now)).toHaveLength(0);
  });

  it("keeps fixes with no or unparseable timestamp", () => {
    expect(dropStalePositions([pos(null), pos("garbage")], now)).toHaveLength(2);
  });
});
