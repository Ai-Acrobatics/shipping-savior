import { describe, it, expect } from "vitest";
import {
  groupShipments,
  extractFilterOptions,
  weekLabel,
  compareWeekLabels,
  hasReviewIssues,
  isoWeek,
  UNSCHEDULED,
  type LoadBoardShipment,
} from "./group";

// ── Fixtures ───────────────────────────────────────────

let seq = 0;
function ship(overrides: Partial<LoadBoardShipment> = {}): LoadBoardShipment {
  seq += 1;
  const { importMeta, ...rest } = overrides;
  return {
    id: `s-${seq}`,
    reference: `REF${seq}`,
    carrier: "Maersk",
    vesselName: "Emma Maersk",
    pol: "Manzanillo",
    pod: "Yokohama",
    etd: "2025-10-01T00:00:00.000Z",
    eta: "2025-10-20T00:00:00.000Z",
    containerNumber: `MAEU000${seq}`,
    status: "in_transit",
    importMeta:
      importMeta === undefined
        ? {
            week: "Week 40",
            customerCode: "RIC",
            crossdockAppointment: "Sep 29 2025 12:00",
            temperature: "0.0 Vents Closed",
            reeferCutoff: "Sep 30 2025 16:00",
            documentCutoff: "Sep 29 2025 12:00",
            reviewIssues: [],
          }
        : importMeta,
    ...rest,
  };
}

function meta(week: string | null, extra: Record<string, unknown> = {}) {
  return { week, customerCode: "RIC", reviewIssues: [], ...extra };
}

// ── Week ordering ──────────────────────────────────────

describe("numeric week ordering", () => {
  it("sorts Week 40 < Week 44 < Week 48 numerically, not lexically", () => {
    const rows = [
      ship({ importMeta: meta("Week 48") }),
      ship({ importMeta: meta("Week 9") }),
      ship({ importMeta: meta("Week 44") }),
      ship({ importMeta: meta("Week 40") }),
    ];
    const weeks = groupShipments(rows).map((w) => w.week);
    expect(weeks).toEqual(["Week 9", "Week 40", "Week 44", "Week 48"]);
  });

  it("keeps Unscheduled last, after ETD-derived weeks", () => {
    const rows = [
      ship({ importMeta: null, etd: null }), // Unscheduled
      ship({ importMeta: null, etd: "2025-10-29T00:00:00.000Z" }), // Week 44 (ETD)
      ship({ importMeta: meta("Week 48") }),
      ship({ importMeta: meta("Week 40") }),
    ];
    const weeks = groupShipments(rows).map((w) => w.week);
    expect(weeks).toEqual(["Week 40", "Week 44 (ETD)", "Week 48", UNSCHEDULED]);
  });

  it("sorts a derived Week N (ETD) bucket directly after the real Week N", () => {
    expect(compareWeekLabels("Week 41", "Week 41 (ETD)")).toBeLessThan(0);
    expect(compareWeekLabels("Week 41 (ETD)", "Week 42")).toBeLessThan(0);
    expect(compareWeekLabels(UNSCHEDULED, "Week 53 (ETD)")).toBeGreaterThan(0);
  });
});

// ── Unscheduled bucketing ──────────────────────────────

describe("unscheduled bucketing", () => {
  it("labels null-importMeta rows with an ETD by ISO week as 'Week N (ETD)'", () => {
    // 2025-10-29 is a Wednesday in ISO week 44.
    const row = ship({ importMeta: null, etd: "2025-10-29T00:00:00.000Z" });
    expect(weekLabel(row)).toBe("Week 44 (ETD)");
  });

  it("labels null-importMeta rows without an ETD as Unscheduled", () => {
    const row = ship({ importMeta: null, etd: null });
    expect(weekLabel(row)).toBe(UNSCHEDULED);
  });

  it("treats an empty/blank meta week like a missing one", () => {
    expect(weekLabel(ship({ importMeta: meta(""), etd: null }))).toBe(UNSCHEDULED);
    expect(
      weekLabel(ship({ importMeta: meta("  "), etd: "2025-10-29T00:00:00.000Z" }))
    ).toBe("Week 44 (ETD)");
  });

  it("falls back to Unscheduled when the ETD is unparseable", () => {
    const row = ship({ importMeta: null, etd: "TBD" });
    expect(weekLabel(row)).toBe(UNSCHEDULED);
  });

  it("computes ISO weeks correctly across a year boundary", () => {
    // 2025-12-31 (Wed) is ISO week 1 of 2026.
    expect(isoWeek(new Date(Date.UTC(2025, 11, 31)))).toBe(1);
    expect(isoWeek(new Date(Date.UTC(2025, 9, 1)))).toBe(40);
  });
});

// ── Grouping within a week ─────────────────────────────

describe("carrier + destination grouping", () => {
  it("groups rows by carrier+destination inside each week", () => {
    const rows = [
      ship({ carrier: "Maersk", pod: "Yokohama", importMeta: meta("Week 40") }),
      ship({ carrier: "Maersk", pod: "Yokohama", importMeta: meta("Week 40") }),
      ship({ carrier: "Maersk", pod: "Busan", importMeta: meta("Week 40") }),
      ship({ carrier: "CMA CGM", pod: "Yokohama", importMeta: meta("Week 40") }),
    ];
    const [week] = groupShipments(rows);
    expect(week.shipmentCount).toBe(4);
    expect(week.groups.map((g) => `${g.carrier}::${g.destination}`)).toEqual([
      "CMA CGM::Yokohama",
      "Maersk::Busan",
      "Maersk::Yokohama",
    ]);
    expect(week.groups[2].shipments).toHaveLength(2);
  });

  it("counts distinct container numbers per week", () => {
    const rows = [
      ship({ containerNumber: "MAEU1111111", importMeta: meta("Week 40") }),
      ship({ containerNumber: "maeu1111111", importMeta: meta("Week 40") }), // dup, case-insensitive
      ship({ containerNumber: "MAEU2222222", importMeta: meta("Week 40") }),
      ship({ containerNumber: null, importMeta: meta("Week 40") }),
    ];
    const [week] = groupShipments(rows);
    expect(week.shipmentCount).toBe(4);
    expect(week.containerCount).toBe(2);
  });

  it("buckets null carrier/destination under Unknown labels", () => {
    const rows = [ship({ carrier: null, pod: null, importMeta: meta("Week 40") })];
    const [week] = groupShipments(rows);
    expect(week.groups[0].carrier).toBe("Unknown carrier");
    expect(week.groups[0].destination).toBe("Unknown destination");
  });
});

// ── Filters ────────────────────────────────────────────

describe("filters", () => {
  const rows = [
    ship({
      carrier: "Maersk",
      pod: "Yokohama",
      importMeta: meta("Week 40", { customerCode: "RIC" }),
    }),
    ship({
      carrier: "CMA CGM",
      pod: "Busan",
      importMeta: meta("Week 40", { customerCode: "FRE" }),
    }),
    ship({
      carrier: "Maersk",
      pod: "Busan",
      importMeta: meta("Week 44", { customerCode: "RIC" }),
    }),
    ship({ carrier: "ONE", pod: "Kaohsiung", importMeta: null, etd: null }),
  ];

  it("filters by week label (including Unscheduled)", () => {
    const weeks = groupShipments(rows, { week: "Week 40" });
    expect(weeks).toHaveLength(1);
    expect(weeks[0].week).toBe("Week 40");
    expect(weeks[0].shipmentCount).toBe(2);

    const unscheduled = groupShipments(rows, { week: UNSCHEDULED });
    expect(unscheduled).toHaveLength(1);
    expect(unscheduled[0].groups[0].carrier).toBe("ONE");
  });

  it("filters by carrier", () => {
    const weeks = groupShipments(rows, { carrier: "Maersk" });
    expect(weeks.map((w) => w.week)).toEqual(["Week 40", "Week 44"]);
    expect(weeks.every((w) => w.groups.every((g) => g.carrier === "Maersk"))).toBe(true);
  });

  it("filters by destination", () => {
    const weeks = groupShipments(rows, { destination: "Busan" });
    expect(weeks.map((w) => w.week)).toEqual(["Week 40", "Week 44"]);
    expect(weeks[0].groups[0].carrier).toBe("CMA CGM");
  });

  it("filters by customer code from importMeta", () => {
    const weeks = groupShipments(rows, { customer: "FRE" });
    expect(weeks).toHaveLength(1);
    expect(weeks[0].shipmentCount).toBe(1);
    expect(weeks[0].groups[0].carrier).toBe("CMA CGM");
  });

  it("applies combined filters (AND semantics)", () => {
    const weeks = groupShipments(rows, {
      week: "Week 44",
      carrier: "Maersk",
      destination: "Busan",
      customer: "RIC",
    });
    expect(weeks).toHaveLength(1);
    expect(weeks[0].shipmentCount).toBe(1);

    const none = groupShipments(rows, {
      week: "Week 44",
      carrier: "Maersk",
      destination: "Busan",
      customer: "FRE",
    });
    expect(none).toHaveLength(0);
  });

  it("customer filter excludes rows with null importMeta", () => {
    const weeks = groupShipments(rows, { customer: "RIC" });
    expect(weeks.map((w) => w.week)).toEqual(["Week 40", "Week 44"]);
    expect(weeks.flatMap((w) => w.groups).some((g) => g.carrier === "ONE")).toBe(false);
  });
});

// ── Null tolerance ─────────────────────────────────────

describe("null tolerance", () => {
  it("handles rows where everything optional is null", () => {
    const bare: LoadBoardShipment = { id: "bare" };
    const weeks = groupShipments([
      bare,
      ship({
        importMeta: { week: null, customerCode: null, reviewIssues: null },
        carrier: null,
        pod: null,
        etd: null,
        reference: null,
        containerNumber: null,
      }),
    ]);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].week).toBe(UNSCHEDULED);
    expect(weeks[0].shipmentCount).toBe(2);
  });

  it("hasReviewIssues only flags non-empty arrays", () => {
    expect(hasReviewIssues(ship({ importMeta: meta("Week 40") }))).toBe(false);
    expect(hasReviewIssues(ship({ importMeta: null }))).toBe(false);
    expect(
      hasReviewIssues(ship({ importMeta: meta("Week 40", { reviewIssues: ["weight TBD"] }) }))
    ).toBe(true);
    expect(
      hasReviewIssues(
        ship({ importMeta: meta("Week 40", { reviewIssues: "not-an-array" }) })
      )
    ).toBe(false);
  });

  it("returns an empty board for empty or missing input", () => {
    expect(groupShipments([])).toEqual([]);
    expect(groupShipments(undefined as unknown as LoadBoardShipment[])).toEqual([]);
  });
});

// ── Filter option extraction ───────────────────────────

describe("extractFilterOptions", () => {
  it("returns distinct sorted weeks, carriers, destinations and customers", () => {
    const rows = [
      ship({ carrier: "ONE", pod: "Busan", importMeta: meta("Week 44", { customerCode: "FRE" }) }),
      ship({ carrier: "Maersk", pod: "Yokohama", importMeta: meta("Week 40", { customerCode: "RIC" }) }),
      ship({ carrier: "Maersk", pod: "Yokohama", importMeta: meta("Week 40", { customerCode: "RIC" }) }),
      ship({ carrier: null, pod: "  ", importMeta: null, etd: null }),
      ship({ carrier: " CMA CGM ", pod: "Kaohsiung", importMeta: null, etd: "2025-10-29T00:00:00.000Z" }),
    ];
    const opts = extractFilterOptions(rows);
    expect(opts.weeks).toEqual(["Week 40", "Week 44", "Week 44 (ETD)", UNSCHEDULED]);
    expect(opts.carriers).toEqual(["CMA CGM", "Maersk", "ONE"]);
    expect(opts.destinations).toEqual(["Busan", "Kaohsiung", "Yokohama"]);
    expect(opts.customers).toEqual(["FRE", "RIC"]);
  });

  it("tolerates empty input", () => {
    expect(extractFilterOptions([])).toEqual({
      weeks: [],
      carriers: [],
      destinations: [],
      customers: [],
    });
  });
});
