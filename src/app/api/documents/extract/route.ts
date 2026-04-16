import { NextRequest, NextResponse } from 'next/server';
import { requireOrg } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { documentExtractions } from '@/lib/db/schema';
import { extractFromDocument } from '@/lib/extraction/claude-ocr';
import type { DocumentType } from '@/lib/db/schema';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB — Claude Vision PDF limit
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/extractions/upload
 *
 * Accepts a PDF or image via multipart/form-data, runs Claude Vision OCR,
 * and persists the structured shipment data to document_extractions.
 *
 * Form fields:
 *   - file: File (PDF or image)
 *   - documentType?: DocumentType hint (defaults to 'other' — Claude detects)
 */
export async function POST(request: NextRequest) {
  const session = await requireOrg();
  const userId = session.user.id as string;
  const orgId = session.user.orgId as string;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form body' }, { status: 400 });
  }

  const file = formData.get('file');
  const documentTypeHint = (formData.get('documentType') as string | null) ?? 'other';

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded. Attach a PDF or image as `file`.' }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Use PDF, PNG, JPEG, WEBP, or GIF.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large: ${file.size} bytes. Max 20 MB.` },
      { status: 413 }
    );
  }

  // Insert record in 'processing' state first so UI can poll / show progress
  const [record] = await db
    .insert(documentExtractions)
    .values({
      orgId,
      userId,
      fileName: file.name || 'untitled',
      fileSize: file.size,
      documentType: documentTypeHint as DocumentType,
      status: 'processing',
    })
    .returning();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const result = await extractFromDocument(
      base64,
      file.type as 'application/pdf' | 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'
    );

    // Prefer Claude-detected documentType if available
    const detectedType = (result.data?.documentType as DocumentType) ?? (documentTypeHint as DocumentType);
    const validTypes: DocumentType[] = [
      'bill_of_lading',
      'commercial_invoice',
      'packing_list',
      'customs_declaration',
      'certificate_of_origin',
      'isf_filing',
      'arrival_notice',
      'other',
    ];
    const finalType: DocumentType = validTypes.includes(detectedType) ? detectedType : 'other';

    const [updated] = await db
      .update(documentExtractions)
      .set({
        status: 'completed',
        documentType: finalType,
        extractedData: result.data,
        rawText: result.rawText ?? null,
        confidence: result.confidence,
        updatedAt: new Date(),
      })
      .where(eqId(record.id))
      .returning();

    return NextResponse.json({ extraction: updated });
  } catch (error) {
    console.error('Extraction failed', error);
    const message = error instanceof Error ? error.message : 'Extraction failed';

    await db
      .update(documentExtractions)
      .set({
        status: 'failed',
        errorMessage: message,
        updatedAt: new Date(),
      })
      .where(eqId(record.id));

    return NextResponse.json(
      { error: message, extractionId: record.id },
      { status: 500 }
    );
  }
}

// Local helper (kept in-file to avoid adding a barrel import)
import { eq } from 'drizzle-orm';
function eqId(id: string) {
  return eq(documentExtractions.id, id);
}
