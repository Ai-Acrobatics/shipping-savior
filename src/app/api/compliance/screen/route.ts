/**
 * POST /api/compliance/screen — AI-12017
 *
 * Pre-shipment compliance screen: denied parties, sanctioned jurisdictions,
 * Section 301, UFLPA and PGA routing, returned as one verdict with a dollar
 * exposure.
 *
 * The analysis is pure and deterministic (see lib/compliance), so this route
 * is auth, validation and error shaping only. No LLM anywhere in the path — a
 * hallucinated "no match" on a sanctions screen is a strict-liability
 * violation, not a bad suggestion.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  ComplianceInputError,
  MAX_LINE_ITEMS,
  MAX_PARTIES,
  screenShipment,
  type ComplianceScreeningInput,
} from "@/lib/compliance";

const partyRoles = [
  "shipper",
  "consignee",
  "ultimate-consignee",
  "notify",
  "manufacturer",
  "supplier",
  "carrier",
  "forwarder",
] as const;

/** ISO 3166-1 alpha-2, loosely — sanctioned jurisdictions sit outside the
 *  sourcing-focused CountryCode union, so this validates shape, not membership. */
const countryCode = z
  .string()
  .trim()
  .min(2)
  .max(2)
  .regex(/^[A-Za-z]{2}$/, "Country must be a two-letter ISO code");

const partySchema = z.object({
  id: z.string().max(64).optional(),
  name: z.string().trim().min(1).max(300),
  role: z.enum(partyRoles),
  country: countryCode.optional(),
  address: z.string().max(500).optional(),
});

const lineItemSchema = z.object({
  id: z.string().max(64).optional(),
  description: z.string().trim().min(1).max(300),
  htsCode: z.string().trim().min(4).max(14),
  countryOfOrigin: countryCode,
  valueUsd: z.number().finite().min(0).max(10_000_000_000),
  manufacturerName: z.string().max(300).optional(),
  manufacturerRegion: z.string().max(200).optional(),
  hasSupplyChainTraceability: z.boolean().optional(),
  pgaDocumentsOnFile: z.array(z.string().max(64)).max(40).optional(),
  section301ExclusionClaimed: z.boolean().optional(),
});

const bodySchema = z.object({
  parties: z.array(partySchema).min(1).max(MAX_PARTIES),
  lineItems: z.array(lineItemSchema).min(1).max(MAX_LINE_ITEMS),
  departureDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  portOfEntry: z.string().max(120).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid shipment",
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  try {
    // evaluationDate is set server-side: PGA lead-time findings decide whether
    // a shipment can still be fixed, and a client-supplied "today" would let
    // that check be argued away.
    const screening = screenShipment({
      ...(parsed.data as ComplianceScreeningInput),
      evaluationDate: new Date().toISOString(),
    });
    return NextResponse.json({ screening });
  } catch (error) {
    if (error instanceof ComplianceInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[compliance/screen] Unexpected failure:", error);
    return NextResponse.json({ error: "Failed to screen shipment" }, { status: 500 });
  }
}
