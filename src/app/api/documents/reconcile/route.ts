/**
 * POST /api/documents/reconcile — AI-12016
 *
 * Compare a set of already-extracted trade documents against each other and
 * against what the cargo profile requires.
 *
 * Individually-valid documents can still be a broken set: the invoice says 240
 * cartons, the packing list says 238, and the discrepancy surfaces as a
 * document-review hold rather than a correction. This endpoint is the check
 * that runs before the entry is filed.
 *
 * Accepts either inline extractions or ids of documents already stored by
 * POST /api/documents, so the UI does not have to round-trip payloads it has
 * already sent once.
 */

import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tradeDocuments } from "@/lib/db/schema";
import {
  DOCUMENT_TYPES,
  reconcileDocumentSet,
  type DocumentExtraction,
} from "@/lib/documents";

const documentTypeSchema = z.enum(
  DOCUMENT_TYPES as [string, ...string[]]
);

const bodySchema = z
  .object({
    documents: z
      .array(
        z.object({
          type: documentTypeSchema,
          fields: z.record(z.string(), z.unknown()),
          confidence: z.record(z.string(), z.number()).optional(),
        })
      )
      .max(25)
      .optional(),
    documentIds: z.array(z.string().uuid()).max(25).optional(),
    profile: z
      .object({
        containsPlantProduct: z.boolean().optional(),
        containsFdaRegulatedProduct: z.boolean().optional(),
        claimsPreferentialOrigin: z.boolean().optional(),
        oceanImportToUs: z.boolean().optional(),
      })
      .optional(),
  })
  .refine(
    (b) => (b.documents?.length ?? 0) + (b.documentIds?.length ?? 0) > 0,
    { message: "Provide at least one document or documentId." }
  );

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.user.orgId;

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
        error: "Invalid reconciliation request",
        details: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  const documents: DocumentExtraction[] = (parsed.data.documents ?? []).map((d) => ({
    type: d.type as DocumentExtraction["type"],
    fields: d.fields,
    confidence: d.confidence ?? {},
  }));

  // Stored documents are always re-read scoped to the caller's org — an id is
  // not authorization.
  if (parsed.data.documentIds?.length) {
    try {
      const rows = await db
        .select({
          documentType: tradeDocuments.documentType,
          extractedJson: tradeDocuments.extractedJson,
          confidenceJson: tradeDocuments.confidenceJson,
        })
        .from(tradeDocuments)
        .where(
          and(
            eq(tradeDocuments.orgId, orgId),
            inArray(tradeDocuments.id, parsed.data.documentIds)
          )
        );

      for (const row of rows) {
        documents.push({
          type: row.documentType as DocumentExtraction["type"],
          fields: (row.extractedJson as Record<string, unknown>) ?? {},
          confidence: (row.confidenceJson as Record<string, number>) ?? {},
        });
      }

      if (rows.length !== parsed.data.documentIds.length) {
        return NextResponse.json(
          {
            error:
              "One or more documentIds were not found for this organization. Reconciling a partial set would report a false all-clear.",
          },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error("[documents/reconcile] Failed to load stored documents:", error);
      return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
    }
  }

  const report = reconcileDocumentSet(documents, parsed.data.profile ?? {});
  return NextResponse.json({ report });
}
