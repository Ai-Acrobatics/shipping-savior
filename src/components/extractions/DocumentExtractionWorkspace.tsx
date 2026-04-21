'use client';

import { useCallback, useMemo, useState } from 'react';
import { FileText, Upload, Trash2, CheckCircle2, AlertCircle, Loader2, Ship } from 'lucide-react';
import type { DocumentExtraction, DocumentType } from '@/lib/db/schema';
import type { ExtractedShipmentData } from '@/lib/types/extraction';
import ExtractedFieldsEditor from './ExtractedFieldsEditor';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  bill_of_lading: 'Bill of Lading',
  commercial_invoice: 'Commercial Invoice',
  packing_list: 'Packing List',
  customs_declaration: 'Customs Declaration',
  certificate_of_origin: 'Certificate of Origin',
  isf_filing: 'ISF Filing (10+2)',
  arrival_notice: 'Arrival Notice',
  other: 'Other',
};

interface Props {
  initialExtractions: DocumentExtraction[];
}

export default function DocumentExtractionWorkspace({ initialExtractions }: Props) {
  const [extractions, setExtractions] = useState<DocumentExtraction[]>(initialExtractions);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialExtractions[0]?.id ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const selected = useMemo(
    () => extractions.find((e) => e.id === selectedId) ?? null,
    [extractions, selectedId]
  );

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/documents/extract', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Upload failed');
      }

      setExtractions((prev) => [json.extraction, ...prev]);
      setSelectedId(json.extraction.id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      handleUpload(files[0]);
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFilesSelected(e.dataTransfer.files);
    },
    [handleFilesSelected]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this extraction? This cannot be undone.')) return;
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExtractions((prev) => prev.filter((e) => e.id !== id));
        if (selectedId === id) setSelectedId(null);
      }
    },
    [selectedId]
  );

  const handleSave = useCallback(
    async (
      id: string,
      patch: { extractedData?: ExtractedShipmentData; documentType?: DocumentType; reviewed?: boolean }
    ) => {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (res.ok && json.extraction) {
        setExtractions((prev) => prev.map((e) => (e.id === id ? json.extraction : e)));
      }
    },
    []
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Upload + history list */}
      <div className="lg:col-span-1 space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? 'border-ocean-500 bg-ocean-50'
              : 'border-navy-200 bg-white hover:border-ocean-300'
          }`}
        >
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="w-10 h-10 text-ocean-600 mx-auto animate-spin" />
              <p className="text-sm font-medium text-navy-700">Extracting with Claude Vision…</p>
              <p className="text-xs text-navy-500">Usually 10–30 seconds per page</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-ocean-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-navy-900">
                Drop a PDF or image here
              </p>
              <p className="text-xs text-navy-500 mt-1">
                Bill of lading, commercial invoice, packing list, customs docs
              </p>
              <label className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-ocean-600 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-ocean-700 hover:to-indigo-600 transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                Choose file
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
              </label>
              <p className="text-[11px] text-navy-400 mt-3">PDF, PNG, JPEG · max 20 MB</p>
            </>
          )}
        </div>

        {uploadError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="bg-white border border-navy-200 rounded-xl">
          <div className="px-4 py-3 border-b border-navy-200">
            <h2 className="text-sm font-semibold text-navy-900">Recent extractions</h2>
          </div>
          <div className="divide-y divide-navy-100 max-h-[60vh] overflow-y-auto">
            {extractions.length === 0 ? (
              <div className="p-6 text-center">
                <FileText className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                <p className="text-xs text-navy-500">No extractions yet. Upload a document to get started.</p>
              </div>
            ) : (
              extractions.map((ext) => (
                <button
                  key={ext.id}
                  onClick={() => setSelectedId(ext.id)}
                  className={`w-full text-left p-3 hover:bg-navy-50 transition-colors ${
                    selectedId === ext.id ? 'bg-ocean-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">
                        {ext.fileName}
                      </p>
                      <p className="text-xs text-navy-500 mt-0.5">
                        {DOCUMENT_TYPE_LABELS[ext.documentType]}
                        {' · '}
                        {new Date(ext.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={ext.status} reviewed={ext.reviewed} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: Selected extraction detail */}
      <div className="lg:col-span-2">
        {selected ? (
          <ExtractedFieldsEditor
            extraction={selected}
            onSave={(patch) => handleSave(selected.id, patch)}
            onDelete={() => handleDelete(selected.id)}
          />
        ) : (
          <div className="bg-white border border-navy-200 rounded-xl p-12 text-center">
            <Ship className="w-12 h-12 text-navy-300 mx-auto mb-3" />
            <p className="text-navy-500 font-medium">Upload a document to get started</p>
            <p className="text-navy-400 text-sm mt-1">
              Extracted fields will appear here for review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, reviewed }: { status: string; reviewed: boolean }) {
  if (status === 'processing' || status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-800 rounded-full">
        <Loader2 className="w-3 h-3 animate-spin" /> Processing
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-red-100 text-red-800 rounded-full">
        <AlertCircle className="w-3 h-3" /> Failed
      </span>
    );
  }
  if (reviewed) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-emerald-100 text-emerald-800 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Reviewed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-ocean-100 text-ocean-800 rounded-full">
      Extracted
    </span>
  );
}
