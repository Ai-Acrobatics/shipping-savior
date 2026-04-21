import { requireOrg } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { documentExtractions } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import DocumentExtractionWorkspace from '@/components/extractions/DocumentExtractionWorkspace';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Document OCR | Shipping Savior',
  description:
    'AI-powered OCR for bills of lading, commercial invoices, packing lists, and customs documents.',
};

export default async function DocumentsPage() {
  const session = await requireOrg();
  const orgId = session.user.orgId as string;

  const rows = await db
    .select()
    .from(documentExtractions)
    .where(eq(documentExtractions.orgId, orgId))
    .orderBy(desc(documentExtractions.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Document OCR</h1>
        <p className="text-navy-500 mt-1">
          Drop in a PDF or image of a bill of lading, commercial invoice, packing list, or
          customs document. Claude Vision extracts shipper, consignee, ports, container numbers,
          HS codes, weights, INCOTERMS, and more — review and correct before saving.
        </p>
      </div>

      <DocumentExtractionWorkspace initialExtractions={JSON.parse(JSON.stringify(rows))} />
    </div>
  );
}
