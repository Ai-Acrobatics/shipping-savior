'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, Trash2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import type { DocumentExtraction, DocumentType } from '@/lib/db/schema';
import type { ExtractedShipmentData } from '@/lib/types/extraction';

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'bill_of_lading', label: 'Bill of Lading' },
  { value: 'commercial_invoice', label: 'Commercial Invoice' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'customs_declaration', label: 'Customs Declaration' },
  { value: 'certificate_of_origin', label: 'Certificate of Origin' },
  { value: 'isf_filing', label: 'ISF Filing (10+2)' },
  { value: 'arrival_notice', label: 'Arrival Notice' },
  { value: 'other', label: 'Other' },
];

interface Props {
  extraction: DocumentExtraction;
  onSave: (patch: {
    extractedData?: ExtractedShipmentData;
    documentType?: DocumentType;
    reviewed?: boolean;
  }) => Promise<void> | void;
  onDelete: () => void;
}

export default function ExtractedFieldsEditor({ extraction, onSave, onDelete }: Props) {
  const initialData = useMemo<ExtractedShipmentData>(
    () => (extraction.extractedData as ExtractedShipmentData) ?? ({ documentType: extraction.documentType } as ExtractedShipmentData),
    [extraction.extractedData, extraction.documentType]
  );

  const [data, setData] = useState<ExtractedShipmentData>(initialData);
  const [docType, setDocType] = useState<DocumentType>(extraction.documentType);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setData(initialData);
    setDocType(extraction.documentType);
    setDirty(false);
  }, [extraction.id, initialData, extraction.documentType]);

  // Processing / failed states don't show an editor
  if (extraction.status === 'processing' || extraction.status === 'pending') {
    return (
      <div className="bg-white border border-navy-200 rounded-xl p-12 text-center">
        <FileText className="w-12 h-12 text-ocean-400 mx-auto mb-3 animate-pulse" />
        <p className="text-navy-700 font-medium">Extracting shipment data…</p>
        <p className="text-navy-400 text-sm mt-1">
          Claude Vision is reading the document. Refresh in a few seconds.
        </p>
      </div>
    );
  }

  if (extraction.status === 'failed') {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-8">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-navy-900 font-semibold">Extraction failed</p>
            <p className="text-sm text-red-700 mt-1">
              {extraction.errorMessage || 'Unknown error'}
            </p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-sm text-red-700 hover:text-red-900 font-medium inline-flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" /> Remove
        </button>
      </div>
    );
  }

  const update = <K extends keyof ExtractedShipmentData>(
    key: K,
    next: ExtractedShipmentData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: next }));
    setDirty(true);
  };

  const updateNested = <K extends keyof ExtractedShipmentData>(
    key: K,
    field: string,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [key]: { ...((prev[key] as object | undefined) ?? {}), [field]: value },
    }));
    setDirty(true);
  };

  const handleSave = async (markReviewed = false) => {
    setSaving(true);
    try {
      await onSave({
        extractedData: data,
        documentType: docType,
        reviewed: markReviewed ? true : extraction.reviewed,
      });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-navy-200 rounded-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-navy-200 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy-900 truncate">{extraction.fileName}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-navy-500">
            <span>
              {(extraction.fileSize / 1024).toFixed(0)} KB · uploaded{' '}
              {new Date(extraction.createdAt).toLocaleString()}
            </span>
            {typeof extraction.confidence === 'number' && (
              <ConfidenceBadge value={extraction.confidence} />
            )}
            {extraction.reviewed && (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" /> Reviewed
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-2 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Body — grouped editable fields */}
      <div className="p-6 space-y-6">
        <Field label="Document Type">
          <select
            value={docType}
            onChange={(e) => {
              setDocType(e.target.value as DocumentType);
              setDirty(true);
            }}
            className="input"
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <FieldGroup title="Parties">
          <Field label="Shipper (Name)">
            <input
              className="input"
              value={data.shipper?.name ?? ''}
              onChange={(e) => updateNested('shipper', 'name', e.target.value)}
            />
          </Field>
          <Field label="Shipper (Address)">
            <input
              className="input"
              value={data.shipper?.address ?? ''}
              onChange={(e) => updateNested('shipper', 'address', e.target.value)}
            />
          </Field>
          <Field label="Consignee (Name)">
            <input
              className="input"
              value={data.consignee?.name ?? ''}
              onChange={(e) => updateNested('consignee', 'name', e.target.value)}
            />
          </Field>
          <Field label="Consignee (Address)">
            <input
              className="input"
              value={data.consignee?.address ?? ''}
              onChange={(e) => updateNested('consignee', 'address', e.target.value)}
            />
          </Field>
          <Field label="Notify Party">
            <input
              className="input"
              value={data.notifyParty?.name ?? ''}
              onChange={(e) => updateNested('notifyParty', 'name', e.target.value)}
            />
          </Field>
        </FieldGroup>

        <FieldGroup title="Route">
          <Field label="Port of Origin">
            <input
              className="input"
              value={data.ports?.origin ?? ''}
              onChange={(e) => updateNested('ports', 'origin', e.target.value)}
            />
          </Field>
          <Field label="Origin UN/LOCODE">
            <input
              className="input"
              value={data.ports?.originCode ?? ''}
              onChange={(e) => updateNested('ports', 'originCode', e.target.value)}
            />
          </Field>
          <Field label="Port of Destination">
            <input
              className="input"
              value={data.ports?.destination ?? ''}
              onChange={(e) => updateNested('ports', 'destination', e.target.value)}
            />
          </Field>
          <Field label="Destination UN/LOCODE">
            <input
              className="input"
              value={data.ports?.destinationCode ?? ''}
              onChange={(e) => updateNested('ports', 'destinationCode', e.target.value)}
            />
          </Field>
          <Field label="Vessel">
            <input
              className="input"
              value={data.vessel?.name ?? ''}
              onChange={(e) => updateNested('vessel', 'name', e.target.value)}
            />
          </Field>
          <Field label="Voyage">
            <input
              className="input"
              value={data.vessel?.voyage ?? ''}
              onChange={(e) => updateNested('vessel', 'voyage', e.target.value)}
            />
          </Field>
        </FieldGroup>

        <FieldGroup title="Cargo">
          <Field label="Description">
            <input
              className="input"
              value={data.cargo?.description ?? ''}
              onChange={(e) => updateNested('cargo', 'description', e.target.value)}
            />
          </Field>
          <Field label="HS Code">
            <input
              className="input"
              value={data.cargo?.hsCode ?? ''}
              onChange={(e) => updateNested('cargo', 'hsCode', e.target.value)}
            />
          </Field>
          <Field label="Gross Weight">
            <input
              className="input"
              value={data.cargo?.grossWeight ?? ''}
              onChange={(e) => updateNested('cargo', 'grossWeight', e.target.value)}
            />
          </Field>
          <Field label="Volume">
            <input
              className="input"
              value={data.cargo?.volume ?? ''}
              onChange={(e) => updateNested('cargo', 'volume', e.target.value)}
            />
          </Field>
          <Field label="Package Count">
            <input
              className="input"
              value={data.cargo?.packageCount ?? ''}
              onChange={(e) => updateNested('cargo', 'packageCount', e.target.value)}
            />
          </Field>
          <Field label="Package Type">
            <input
              className="input"
              value={data.cargo?.packageType ?? ''}
              onChange={(e) => updateNested('cargo', 'packageType', e.target.value)}
            />
          </Field>
        </FieldGroup>

        <FieldGroup title="Financial">
          <Field label="Total Value">
            <input
              className="input"
              value={data.financials?.totalValue ?? ''}
              onChange={(e) => updateNested('financials', 'totalValue', e.target.value)}
            />
          </Field>
          <Field label="Currency">
            <input
              className="input"
              value={data.financials?.currency ?? ''}
              onChange={(e) => updateNested('financials', 'currency', e.target.value)}
            />
          </Field>
          <Field label="INCOTERM">
            <input
              className="input"
              value={data.financials?.incoterm ?? ''}
              onChange={(e) => updateNested('financials', 'incoterm', e.target.value)}
            />
          </Field>
          <Field label="Freight Charges">
            <input
              className="input"
              value={data.financials?.freightCharges ?? ''}
              onChange={(e) => updateNested('financials', 'freightCharges', e.target.value)}
            />
          </Field>
        </FieldGroup>

        <FieldGroup title="References">
          <Field label="Bill of Lading #">
            <input
              className="input"
              value={data.references?.billOfLadingNumber ?? ''}
              onChange={(e) => updateNested('references', 'billOfLadingNumber', e.target.value)}
            />
          </Field>
          <Field label="Booking #">
            <input
              className="input"
              value={data.references?.bookingNumber ?? ''}
              onChange={(e) => updateNested('references', 'bookingNumber', e.target.value)}
            />
          </Field>
          <Field label="PO #">
            <input
              className="input"
              value={data.references?.poNumber ?? ''}
              onChange={(e) => updateNested('references', 'poNumber', e.target.value)}
            />
          </Field>
          <Field label="Invoice #">
            <input
              className="input"
              value={data.references?.invoiceNumber ?? ''}
              onChange={(e) => updateNested('references', 'invoiceNumber', e.target.value)}
            />
          </Field>
        </FieldGroup>

        <FieldGroup title="Dates">
          <Field label="ETD">
            <input
              className="input"
              value={data.dates?.etd ?? ''}
              onChange={(e) => updateNested('dates', 'etd', e.target.value)}
            />
          </Field>
          <Field label="ETA">
            <input
              className="input"
              value={data.dates?.eta ?? ''}
              onChange={(e) => updateNested('dates', 'eta', e.target.value)}
            />
          </Field>
          <Field label="Shipment Date">
            <input
              className="input"
              value={data.dates?.shipmentDate ?? ''}
              onChange={(e) => updateNested('dates', 'shipmentDate', e.target.value)}
            />
          </Field>
          <Field label="Invoice Date">
            <input
              className="input"
              value={data.dates?.invoiceDate ?? ''}
              onChange={(e) => updateNested('dates', 'invoiceDate', e.target.value)}
            />
          </Field>
        </FieldGroup>

        {Array.isArray(data.containers) && data.containers.length > 0 && (
          <FieldGroup title={`Containers (${data.containers.length})`}>
            <div className="col-span-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-navy-500 uppercase">
                  <tr>
                    <th className="text-left py-1 pr-3">Number</th>
                    <th className="text-left py-1 pr-3">Seal</th>
                    <th className="text-left py-1 pr-3">Type</th>
                    <th className="text-left py-1 pr-3">Weight</th>
                    <th className="text-left py-1 pr-3">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {data.containers.map((c, i) => (
                    <tr key={i} className="border-t border-navy-100">
                      <td className="py-1 pr-3 font-mono text-xs">{c.number ?? '—'}</td>
                      <td className="py-1 pr-3 font-mono text-xs">{c.sealNumber ?? '—'}</td>
                      <td className="py-1 pr-3">{c.type ?? '—'}</td>
                      <td className="py-1 pr-3">{c.weight ?? '—'}</td>
                      <td className="py-1 pr-3">{c.volume ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FieldGroup>
        )}

        {data.additionalNotes && (
          <Field label="Notes">
            <textarea
              className="input min-h-[80px]"
              value={data.additionalNotes}
              onChange={(e) => update('additionalNotes', e.target.value)}
            />
          </Field>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-navy-200 flex items-center justify-between bg-navy-50 rounded-b-xl">
        <p className="text-xs text-navy-500">
          {dirty ? 'Unsaved changes' : 'Up to date'}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-navy-200 text-navy-700 text-sm font-medium rounded-lg hover:bg-navy-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save corrections'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-ocean-600 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-ocean-700 hover:to-indigo-600 disabled:opacity-50 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark reviewed
          </button>
        </div>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          font-size: 0.875rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid rgb(226 232 240);
          border-radius: 0.5rem;
          background: white;
          color: rgb(15 23 42);
          transition: border-color 120ms;
        }
        :global(.input:focus) {
          outline: none;
          border-color: rgb(14 165 233);
          box-shadow: 0 0 0 3px rgb(14 165 233 / 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-navy-600 block mb-1">{label}</span>
      {children}
    </label>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-navy-900 mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const color =
    value >= 85
      ? 'bg-emerald-100 text-emerald-800'
      : value >= 65
      ? 'bg-amber-100 text-amber-800'
      : 'bg-red-100 text-red-800';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full ${color}`}>
      {value}% confidence
    </span>
  );
}
