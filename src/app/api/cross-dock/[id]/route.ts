import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { crossDockAppointments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/cross-dock/[id] — update appointment status or details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const updates: Record<string, unknown> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.timeSlot !== undefined) updates.timeSlot = body.timeSlot;
    if (body.appointmentDate !== undefined) updates.appointmentDate = new Date(body.appointmentDate as string);
    if (body.carrier !== undefined) updates.carrier = body.carrier;
    if (body.vesselName !== undefined) updates.vesselName = body.vesselName;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.containerCount !== undefined) updates.containerCount = body.containerCount;
    updates.updatedAt = new Date();

    const [updated] = await db
      .update(crossDockAppointments)
      .set(updates)
      .where(eq(crossDockAppointments.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ appointment: updated });
  } catch (error) {
    console.error("Failed to update cross-dock appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 },
    );
  }
}

// DELETE /api/cross-dock/[id] — cancel/delete an appointment
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(crossDockAppointments)
      .where(eq(crossDockAppointments.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete cross-dock appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 },
    );
  }
}
