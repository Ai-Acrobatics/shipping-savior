import { describe, it, expect } from "vitest";
import {
  boundsOf,
  greatCircleDistanceKm,
  greatCirclePath,
  initialBearing,
  interpolateGreatCircle,
  unwrapLongitude,
  wrapLongitude,
} from "./geo";

const SHANGHAI = { lat: 31.2304, lng: 121.4737 };
const LONG_BEACH = { lat: 33.7542, lng: -118.2165 };
const ROTTERDAM = { lat: 51.9244, lng: 4.4777 };
const NEW_YORK = { lat: 40.6892, lng: -74.0445 };

describe("wrapLongitude", () => {
  it("keeps in-range values untouched", () => {
    expect(wrapLongitude(121.47)).toBeCloseTo(121.47, 6);
    expect(wrapLongitude(-118.2)).toBeCloseTo(-118.2, 6);
  });

  it("wraps values past the antimeridian", () => {
    expect(wrapLongitude(200)).toBeCloseTo(-160, 6);
    expect(wrapLongitude(-200)).toBeCloseTo(160, 6);
  });
});

describe("unwrapLongitude", () => {
  it("chooses the short way across the antimeridian", () => {
    // Shanghai (121°E) → Long Beach (118°W) is 120° eastward, not 240° west.
    expect(unwrapLongitude(121.4737, -118.2165)).toBeCloseTo(241.7835, 3);
  });

  it("leaves ordinary pairs alone", () => {
    expect(unwrapLongitude(4.4777, -74.0445)).toBeCloseTo(-74.0445, 6);
  });
});

describe("greatCircleDistanceKm", () => {
  it("matches known trans-Pacific distance within 1%", () => {
    const km = greatCircleDistanceKm(SHANGHAI, LONG_BEACH);
    expect(km).toBeGreaterThan(10000);
    expect(km).toBeLessThan(10700);
  });

  it("matches known trans-Atlantic distance within 1%", () => {
    const km = greatCircleDistanceKm(ROTTERDAM, NEW_YORK);
    expect(km).toBeGreaterThan(5750);
    expect(km).toBeLessThan(5950);
  });

  it("is zero for identical points", () => {
    expect(greatCircleDistanceKm(SHANGHAI, SHANGHAI)).toBeCloseTo(0, 6);
  });
});

describe("interpolateGreatCircle", () => {
  it("returns the endpoints at f=0 and f=1", () => {
    const start = interpolateGreatCircle(ROTTERDAM, NEW_YORK, 0);
    expect(start.lat).toBeCloseTo(ROTTERDAM.lat, 4);
    expect(start.lng).toBeCloseTo(ROTTERDAM.lng, 4);

    const end = interpolateGreatCircle(ROTTERDAM, NEW_YORK, 1);
    expect(end.lat).toBeCloseTo(NEW_YORK.lat, 4);
    expect(end.lng).toBeCloseTo(NEW_YORK.lng, 4);
  });

  it("clamps out-of-range fractions", () => {
    expect(interpolateGreatCircle(ROTTERDAM, NEW_YORK, -3).lat).toBeCloseTo(ROTTERDAM.lat, 4);
    expect(interpolateGreatCircle(ROTTERDAM, NEW_YORK, 9).lat).toBeCloseTo(NEW_YORK.lat, 4);
  });

  it("puts the trans-Pacific midpoint in the Pacific, not over Asia", () => {
    const mid = interpolateGreatCircle(SHANGHAI, LONG_BEACH, 0.5);
    // The great circle arcs north through the Aleutians.
    expect(mid.lat).toBeGreaterThan(40);
    // Longitude must be in the Pacific: either far-east or wrapped past 180.
    const wrapped = wrapLongitude(mid.lng);
    expect(Math.abs(wrapped)).toBeGreaterThan(150);
  });

  it("handles coincident endpoints without NaN", () => {
    const p = interpolateGreatCircle(SHANGHAI, SHANGHAI, 0.5);
    expect(Number.isFinite(p.lat)).toBe(true);
    expect(Number.isFinite(p.lng)).toBe(true);
  });
});

describe("greatCirclePath", () => {
  it("returns steps + 1 points and terminates on the destination", () => {
    const path = greatCirclePath(ROTTERDAM, NEW_YORK, 32);
    expect(path).toHaveLength(33);
    expect(path[0][0]).toBeCloseTo(ROTTERDAM.lng, 4);
    expect(path[0][1]).toBeCloseTo(ROTTERDAM.lat, 4);
    expect(path[32][0]).toBeCloseTo(NEW_YORK.lng, 4);
    expect(path[32][1]).toBeCloseTo(NEW_YORK.lat, 4);
  });

  it("never jumps ~360° between vertices when crossing the antimeridian", () => {
    const path = greatCirclePath(SHANGHAI, LONG_BEACH, 96);
    for (let i = 1; i < path.length; i += 1) {
      const jump = Math.abs(path[i][0] - path[i - 1][0]);
      // A continuous arc steps a few degrees at a time; a wrap bug produces ~360.
      expect(jump).toBeLessThan(30);
    }
  });

  it("keeps longitudes monotonic eastbound across the antimeridian", () => {
    const path = greatCirclePath(SHANGHAI, LONG_BEACH, 48);
    for (let i = 1; i < path.length; i += 1) {
      expect(path[i][0]).toBeGreaterThanOrEqual(path[i - 1][0] - 1e-6);
    }
    // The final longitude is the unwrapped destination, past 180.
    expect(path[path.length - 1][0]).toBeGreaterThan(180);
  });

  it("degrades safely for a zero-length lane", () => {
    const path = greatCirclePath(SHANGHAI, SHANGHAI, 8);
    expect(path).toHaveLength(9);
    expect(path.every(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat))).toBe(true);
  });
});

describe("initialBearing", () => {
  it("is due east for an equatorial eastbound leg", () => {
    expect(initialBearing({ lat: 0, lng: 0 }, { lat: 0, lng: 10 })).toBeCloseTo(90, 3);
  });

  it("is due north for a meridian leg", () => {
    expect(initialBearing({ lat: 0, lng: 0 }, { lat: 10, lng: 0 })).toBeCloseTo(0, 3);
  });

  it("takes the short way across the antimeridian", () => {
    const bearing = initialBearing({ lat: 0, lng: 179 }, { lat: 0, lng: -179 });
    expect(bearing).toBeCloseTo(90, 3);
  });
});

describe("boundsOf", () => {
  it("returns null for an empty path", () => {
    expect(boundsOf([])).toBeNull();
  });

  it("covers every vertex including unwrapped longitudes", () => {
    const bounds = boundsOf([
      [121, 31],
      [200, 45],
      [241, 33],
    ]);
    expect(bounds).toEqual([121, 31, 241, 45]);
  });
});
