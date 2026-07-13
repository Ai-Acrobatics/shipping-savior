"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";

/**
 * Inline "edit one field" control used by Settings for the profile name and
 * organization name. Toggles the field editable, PATCHes the given endpoint
 * with { [field]: value }, then refreshes the server component.
 */
export default function InlineNameEditor({
  label,
  initial,
  endpoint,
  field = "name",
  canEdit = true,
}: {
  label: string;
  initial: string;
  endpoint: string;
  field?: string;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!value.trim()) {
      setError("Cannot be empty");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value.trim() }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? "Save failed");
      }
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-navy-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={!editing}
          className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
            editing
              ? "border-ocean-400 bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500/30"
              : "border-navy-200 bg-navy-50 text-navy-600"
          }`}
        />
        {/* AI-12732: explicit labeled buttons — the bare pencil icon tested
            as invisible; Clerk-style "Edit / Save / Cancel" reads instantly. */}
        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-2 text-xs font-semibold text-navy-600 transition-colors hover:border-ocean-400 hover:text-ocean-600"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
        {editing && (
          <>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-ocean-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-ocean-500 disabled:opacity-50"
              aria-label="Save"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
            <button
              onClick={() => {
                setValue(initial);
                setEditing(false);
                setError(null);
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-navy-500 transition-colors hover:bg-navy-100"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
