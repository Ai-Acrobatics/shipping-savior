import { describe, it, expect } from "vitest";
import {
  laneFor,
  parseLooseDate,
  slotTime,
  buildSlots,
  lanesFor,
  buildWeekGrid,
  defaultWeekStart,
  startOfWeek,
  dayKey,
  type CrossDockShipment,
} from "./board";

function row(id: string, meta: CrossDockShipment["importMeta"], extra: Partial<CrossDockShipment> = {}): CrossDockShipment {
  return { id, reference: id.toUpperCase(), importMeta: meta, ...extra };
}

describe("laneFor", () => {
  it("maps the real workbook operator spellings", () => {
    expect(laneFor("KINGSCO DRAY").id).toBe("kingsco");
    expect(laneFor("Kings Co").id).toBe("kingsco");
    expect(laneFor("ANACAPA").id).toBe("anacapa");
    expect(laneFor("Delivery @ Port").id).toBe("port");
    expect(laneFor("Port Hueneme").id).toBe("port");
  });

  it("treats empty, placeholders and bare dates as unassigned", () => {
    expect(laneFor(null).id).toBe("unassigned");
    expect(laneFor("  ").id).toBe("unassigned");
    expect(laneFor("TBD").id).toBe("unassigned");
    expect(laneFor("Sep 29 2025 12:00").id).toBe("unassigned");
    expect(laneFor("09/29/2025 12:00 PM").id).toBe("unassigned");
  });

  it("keeps an unknown operator as its own lane rather than dropping it", () => {
    const lane = laneFor("Pacific Coldstore 10/01/2025 08:00");
    expect(lane.id).toBe("other:PACIFIC COLDSTORE");
    expect(lane.label).toBe("PACIFIC COLDSTORE");
  });

  it("an operator plus a date still lands in the operator's lane", () => {
    expect(laneFor("ANACAPA 09/30/2025 07:00").id).toBe("anacapa");
  });
});

describe("parseLooseDate", () => {
  it("parses the formats the workbook actually contains", () => {
    expect(parseLooseDate("09/29/2025 12:00")?.getDate()).toBe(29);
    expect(parseLooseDate("Sep 30 2025 16:00")?.getHours()).toBe(16);
    expect(parseLooseDate("2025-09-29T15:00:00.000Z")?.toISOString()).toBe("2025-09-29T15:00:00.000Z");
  });

  it("refuses operator names and placeholders instead of guessing", () => {
    expect(parseLooseDate("TBD")).toBeNull();
    expect(parseLooseDate("KINGSCO DRAY")).toBeNull();
    // V8's legacy parser reads this as a year; we must not.
    expect(parseLooseDate("ANACAPA 1")).toBeNull();
    expect(parseLooseDate("")).toBeNull();
    expect(parseLooseDate(null)).toBeNull();
  });
});

describe("slotTime", () => {
  it("prefers an explicit appointment, then reefer cutoff, doc cutoff, ETD", () => {
    expect(slotTime(row("a", { crossdockAppointment: "ANACAPA 09/30/2025 07:00", reeferCutoff: "09/29/2025 12:00" })).source).toBe("appointment");
    expect(slotTime(row("b", { crossdockAppointment: "ANACAPA", reeferCutoff: "09/29/2025 12:00" })).source).toBe("reefer_cutoff");
    expect(slotTime(row("c", { crossdockAppointment: "ANACAPA", reeferCutoff: "TBD", documentCutoff: "Oct 1 2025 11:00" })).source).toBe("document_cutoff");
    expect(slotTime(row("d", { crossdockAppointment: "ANACAPA" }, { etd: "2025-10-02T12:00:00Z" })).source).toBe("etd");
    expect(slotTime(row("e", { crossdockAppointment: "ANACAPA", reeferCutoff: "TBD" })).source).toBe("none");
  });
});

describe("buildSlots", () => {
  it("excludes manual/BOL rows with no import meta", () => {
    const slots = buildSlots([
      row("wb", { crossdockAppointment: "KINGSCO DRAY", reeferCutoff: "09/29/2025 12:00" }),
      { id: "manual", reference: "BOL-1", importMeta: null },
    ]);
    expect(slots.map((s) => s.shipment.id)).toEqual(["wb"]);
  });

  it("flags two different bookings at one dock in the same minute", () => {
    const slots = buildSlots([
      row("x1", { crossdockAppointment: "ANACAPA 09/30/2025 07:00" }),
      row("x2", { crossdockAppointment: "ANACAPA 09/30/2025 07:00" }),
      row("x3", { crossdockAppointment: "KINGSCO 09/30/2025 07:00" }),
    ]);
    const byId = Object.fromEntries(slots.map((s) => [s.shipment.id, s.collision]));
    expect(byId).toEqual({ x1: true, x2: true, x3: false });
  });

  it("does not flag a shared reefer cutoff — that is one vessel, not a dock conflict", () => {
    const slots = buildSlots([
      row("y1", { crossdockAppointment: "ANACAPA", reeferCutoff: "09/29/2025 12:00" }),
      row("y2", { crossdockAppointment: "ANACAPA", reeferCutoff: "09/29/2025 12:00" }),
    ]);
    expect(slots.every((s) => !s.collision)).toBe(true);
  });

  it("does not flag multiple containers of one booking", () => {
    const slots = buildSlots([
      { id: "c1", reference: "RICFJP621700", importMeta: { crossdockAppointment: "KINGSCO 10/01/2025 08:00" } },
      { id: "c2", reference: "RICFJP621700", importMeta: { crossdockAppointment: "KINGSCO 10/01/2025 08:00" } },
    ]);
    expect(slots.every((s) => !s.collision)).toBe(true);
  });

  it("orders slots by time, undated last", () => {
    const slots = buildSlots([
      row("late", { crossdockAppointment: "ANACAPA", reeferCutoff: "10/02/2025 12:00" }),
      row("none", { crossdockAppointment: "ANACAPA" }),
      row("early", { crossdockAppointment: "ANACAPA", reeferCutoff: "09/29/2025 12:00" }),
    ]);
    expect(slots.map((s) => s.shipment.id)).toEqual(["early", "late", "none"]);
  });
});

describe("lanesFor", () => {
  it("always shows the three known docks, extra operators next, Unassigned last", () => {
    const slots = buildSlots([
      row("u", { crossdockAppointment: null }),
      row("o", { crossdockAppointment: "Pacific Coldstore" }),
    ]);
    expect(lanesFor(slots).map((l) => l.id)).toEqual([
      "kingsco",
      "anacapa",
      "port",
      "other:PACIFIC COLDSTORE",
      "unassigned",
    ]);
  });

  it("omits Unassigned when every row has an operator", () => {
    const slots = buildSlots([row("k", { crossdockAppointment: "KINGSCO DRAY" })]);
    expect(lanesFor(slots).map((l) => l.id)).toEqual(["kingsco", "anacapa", "port"]);
  });
});

describe("week grid", () => {
  const slots = buildSlots([
    row("mon", { crossdockAppointment: "KINGSCO DRAY", reeferCutoff: "09/29/2025 12:00" }), // Mon
    row("tue", { crossdockAppointment: "ANACAPA", reeferCutoff: "09/30/2025 12:00" }), // Tue
    row("next", { crossdockAppointment: "Delivery @ Port", reeferCutoff: "10/07/2025 12:00" }), // next week
    row("undated", { crossdockAppointment: "ANACAPA", reeferCutoff: "TBD" }),
  ]);

  it("starts weeks on Monday", () => {
    expect(dayKey(startOfWeek(new Date(2025, 9, 2, 15)))).toBe("2025-09-29");
    expect(dayKey(startOfWeek(new Date(2025, 9, 5, 15)))).toBe("2025-09-29"); // Sunday
  });

  it("places slots into lane × day cells and keeps out-of-week rows out", () => {
    const grid = buildWeekGrid(slots, new Date(2025, 8, 29));
    expect(grid.days).toHaveLength(7);
    expect(grid.cells.kingsco["2025-09-29"].map((s) => s.shipment.id)).toEqual(["mon"]);
    expect(grid.cells.anacapa["2025-09-30"].map((s) => s.shipment.id)).toEqual(["tue"]);
    expect(Object.values(grid.cells.port).flat()).toHaveLength(0);
    expect(grid.undated.anacapa.map((s) => s.shipment.id)).toEqual(["undated"]);
    expect(grid.total).toBe(2);
  });

  it("opens on this week when something is due, else the next upcoming week", () => {
    expect(dayKey(defaultWeekStart(slots, new Date(2025, 8, 30, 9)))).toBe("2025-09-29");
    expect(dayKey(defaultWeekStart(slots, new Date(2025, 8, 20, 9)))).toBe("2025-09-29");
    expect(dayKey(defaultWeekStart(slots, new Date(2025, 9, 3, 9)))).toBe("2025-09-29"); // still has Mon/Tue rows
    expect(dayKey(defaultWeekStart(slots, new Date(2025, 9, 6, 9)))).toBe("2025-10-06");
    // Everything in the past: land on the latest week rather than an empty one.
    expect(dayKey(defaultWeekStart(slots, new Date(2026, 0, 10)))).toBe("2025-10-06");
  });
});
