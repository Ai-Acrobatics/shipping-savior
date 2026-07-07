/**
 * PATCH /api/shipments/[id] — update AES filing status + optional metadata.
 *
 * Accepts: { aesStatus?, aesNumber?, aceDeepLink? }
 * Returns the updated shipment row.
 *
 * AI-12006: AES filing tracker — per-shipment AES status with CBP ACE deep links.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shipments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { aesStatus, aesNumber, aceDeepLink } = body as {
    aesStatus?: string;
    aesNumber?: string | null;
    aceDeepLink?: string | null;
  };

  // Validate aesStatus if provided
  const validStatuses = ["tbd", "filed", "accepted"];
  if (aesStatus !== undefined && !validStatuses.includes(aesStatus)) {
    return NextResponse.json(
      { error: `Invalid aesStatus. Must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const updates: Record<string, unknown> = {};
    if (aesStatus !== undefined) updates.aesStatus = aesStatus;
    if (aesNumber !== undefined) updates.aesNumber = aesNumber || null;
    if (aceDeepLink !== undefined) updates.aceDeepLink = aceDeepLink || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid AES fields to update" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(shipments)
      .set(updates)
      .where(eq(shipments.id, id))
      .returning({
        id: shipments.id,
        aesStatus: shipments.aesStatus,
        aesNumber: shipments.aesNumber,
        aceDeepLink: shipments.aceDeepLink,
      });

    if (!updated) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ shipment: updated });
  } catch (error) {
    console.error("Failed to update AES status:", error);
    return NextResponse.json(
      { error: "Failed to update AES status" },
      { status: 500 }
    );
  }
}
