import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { crossDockAppointments } from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

// GET /api/cross-dock — fetch appointments, optionally filtered by date range or location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const from = searchParams.get("from"); // ISO date string
    const to = searchParams.get("to");     // ISO date string

    let where = undefined;

    if (location && from && to) {
      where = and(
        eq(crossDockAppointments.location, location as "port_hueneme" | "anacapa" | "kingsco"),
        gte(crossDockAppointments.appointmentDate, new Date(from)),
        lte(crossDockAppointments.appointmentDate, new Date(to)),
      );
    } else if (location) {
      where = eq(crossDockAppointments.location, location as "port_hueneme" | "anacapa" | "kingsco");
    } else if (from && to) {
      where = and(
        gte(crossDockAppointments.appointmentDate, new Date(from)),
        lte(crossDockAppointments.appointmentDate, new Date(to)),
      );
    }

    const rows = await db
      .select()
      .from(crossDockAppointments)
      .where(where)
      .orderBy(crossDockAppointments.appointmentDate, desc(crossDockAppointments.timeSlot));

    return NextResponse.json({ appointments: rows });
  } catch (error) {
    console.error("Failed to fetch cross-dock appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 },
    );
  }
}

// POST /api/cross-dock — create a new appointment
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    orgId,
    userId,
    location,
    appointmentDate,
    timeSlot,
    carrier,
    vesselName,
    voyageNumber,
    containerCount,
    containerNumbers,
    reference,
    notes,
    shipmentId,
  } = body as Record<string, unknown>;

  if (!orgId || !userId || !location || !appointmentDate || !timeSlot || !carrier) {
    return NextResponse.json(
      { error: "Missing required fields: orgId, userId, location, appointmentDate, timeSlot, carrier" },
      { status: 400 },
    );
  }

  try {
    const [appointment] = await db
      .insert(crossDockAppointments)
      .values({
        orgId: orgId as string,
        userId: userId as string,
        location: location as "port_hueneme" | "anacapa" | "kingsco",
        appointmentDate: new Date(appointmentDate as string),
        timeSlot: timeSlot as string,
        carrier: carrier as string,
        vesselName: (vesselName as string) ?? null,
        voyageNumber: (voyageNumber as string) ?? null,
        containerCount: (containerCount as number) ?? 1,
        containerNumbers: (containerNumbers as string[]) ?? null,
        reference: (reference as string) ?? null,
        notes: (notes as string) ?? null,
        shipmentId: (shipmentId as string) ?? null,
      })
      .returning();

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cross-dock appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 },
    );
  }
}
