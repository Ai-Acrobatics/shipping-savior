// ============================================================
// Customs broker handoff — cover sheet (AI-12018)
//
// The first page the broker reads. Two renderings from one manifest:
//
//   * plain text — goes in the ZIP as COVER-SHEET.txt, survives being printed,
//     pasted into an email or opened on a machine with nothing installed
//   * HTML — the broker-facing web page and a printable copy in the ZIP
//
// Ordering is deliberate: what has to be fixed comes before what was sent.
// A broker who opens this and reads "12 documents attached" before "the ISF
// was filed 6 hours before lading" has been handed a filing risk dressed up
// as a delivery receipt.
// ============================================================

import { getDocumentSpec } from "@/lib/documents/registry";
import type { HandoffManifest } from "./types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toISOString().replace("T", " ").slice(0, 16)} UTC`;
}

function formatDateOnly(iso: string | null): string {
  if (!iso) return "not stated";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toISOString().slice(0, 10);
}

function formatMoney(value: number | null, currency: string | null): string {
  if (value === null) return "not agreed across documents";
  const amount = value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${amount} ${currency}` : amount;
}

function orDash(value: string | null | undefined, fallback = "not stated"): string {
  return value && String(value).trim() ? String(value).trim() : fallback;
}

/** Field labels, resolved from the document registry so they never drift. */
function fieldLabel(type: HandoffManifest["documents"][number]["type"], key: string): string {
  const spec = getDocumentSpec(type);
  return spec.fields.find((f) => f.key === key)?.label ?? key;
}

// ─── Plain text ───────────────────────────────────────────

export function renderCoverSheetText(manifest: HandoffManifest): string {
  const s = manifest.shipment;
  const lines: string[] = [];

  lines.push("CUSTOMS BROKER HANDOFF PACKAGE");
  lines.push("=".repeat(64));
  lines.push(`Package ID     ${manifest.packageId}`);
  lines.push(`Prepared       ${formatTimestamp(manifest.generatedAt)}`);
  lines.push(`Link expires   ${formatTimestamp(manifest.expiresAt)}`);
  if (manifest.preparedBy.organization) lines.push(`Prepared by    ${manifest.preparedBy.organization}`);
  if (manifest.preparedBy.user) lines.push(`Contact        ${manifest.preparedBy.user}`);
  if (manifest.broker.name || manifest.broker.email) {
    lines.push(`For            ${orDash(manifest.broker.name, "customs broker")}${manifest.broker.email ? ` <${manifest.broker.email}>` : ""}`);
  }
  lines.push("");

  // ── Status banner ──
  if (manifest.releasedWithBlockers) {
    lines.push("!! RELEASED WITH UNRESOLVED BLOCKERS");
    lines.push(
      `   ${manifest.blockerCount} blocking issue${manifest.blockerCount === 1 ? "" : "s"} ` +
        "listed below were acknowledged, not fixed. Do not file against this set until they are resolved."
    );
  } else if (manifest.clearedToFile) {
    lines.push("OK  CLEARED TO FILE");
    lines.push("   Every document validates and the set agrees with itself.");
  } else {
    lines.push("!! NOT CLEARED TO FILE");
    lines.push(`   ${manifest.blockerCount} blocking issue${manifest.blockerCount === 1 ? "" : "s"} must be resolved first.`);
  }
  if (manifest.warningCount) {
    lines.push(`   ${manifest.warningCount} warning${manifest.warningCount === 1 ? "" : "s"} — review, non-blocking.`);
  }
  lines.push("");

  // ── Action list first ──
  if (manifest.actionItems.length) {
    lines.push("ACTION REQUIRED");
    lines.push("-".repeat(64));
    manifest.actionItems.forEach((item, i) => {
      lines.push(`${String(i + 1).padStart(2, " ")}. [${item.severity.toUpperCase()}] ${item.message}`);
    });
    lines.push("");
  }

  // ── Shipment ──
  lines.push("SHIPMENT");
  lines.push("-".repeat(64));
  const facts: Array<[string, string]> = [
    ["Reference", orDash(s.reference)],
    ["Bill of lading", orDash(s.blNumber)],
    ["Invoice", orDash(s.invoiceNumber)],
    ["Containers", s.containerNumbers.length ? s.containerNumbers.join(", ") : "not stated"],
    ["Vessel / voyage", `${orDash(s.vesselName)} / ${orDash(s.voyageNumber)}`],
    ["Carrier", orDash(s.carrier)],
    ["Load / discharge", `${orDash(s.portOfLoading)} -> ${orDash(s.portOfDischarge)}`],
    ["ETD / ETA", `${formatDateOnly(s.etd)} / ${formatDateOnly(s.eta)}`],
    ["Shipper", orDash(s.shipper)],
    ["Consignee", orDash(s.consignee)],
    ["Country of origin", orDash(s.countryOfOrigin)],
    ["Incoterm", orDash(s.incoterm)],
    ["Declared value", formatMoney(s.declaredValue, s.currency)],
    ["HTS codes", s.htsCodes.length ? s.htsCodes.join(", ") : "not stated"],
    ["Gross weight", s.grossWeightKg === null ? "not agreed across documents" : `${s.grossWeightKg.toLocaleString("en-US")} kg`],
    ["Packages", s.packageCount === null ? "not agreed across documents" : s.packageCount.toLocaleString("en-US")],
  ];
  const width = Math.max(...facts.map(([k]) => k.length));
  for (const [key, value] of facts) lines.push(`${key.padEnd(width)}  ${value}`);
  lines.push("");
  lines.push(
    "Anything reported as \"not agreed across documents\" is a value the documents state differently. It has been left blank on purpose — the disagreement is in the action list above."
  );
  lines.push("");

  // ── Enclosures ──
  lines.push(`ENCLOSED DOCUMENTS (${manifest.documents.length})`);
  lines.push("-".repeat(64));
  manifest.documents.forEach((doc, i) => {
    const status = doc.valid
      ? "validates"
      : `${doc.blockerCount} blocker${doc.blockerCount === 1 ? "" : "s"}`;
    lines.push(`${String(i + 1).padStart(2, " ")}. ${doc.label} — ${status}`);
    // When the original is not in the archive, say so on the same line rather
    // than printing the upload name, which reads like an attachment.
    lines.push(
      `    File      ${
        doc.archivePath ??
        `NOT ATTACHED${doc.fileName ? ` (uploaded as ${doc.fileName})` : ""}`
      }`
    );
    lines.push(`    Complete  ${Math.round(doc.completeness * 100)}% of required fields read`);
    if (!doc.archivePath && doc.omissionReason) lines.push(`    Note      ${doc.omissionReason}`);
    if (doc.missingRequired.length) {
      lines.push(
        `    Missing   ${doc.missingRequired.map((k) => fieldLabel(doc.type, k)).join(", ")}`
      );
    }
    if (doc.lowConfidenceFields.length) {
      lines.push(
        `    Verify    ${doc.lowConfidenceFields.map((k) => fieldLabel(doc.type, k)).join(", ")} (read with low confidence)`
      );
    }
  });
  lines.push("");

  if (manifest.missingDocuments.length) {
    lines.push("NOT ENCLOSED BUT REQUIRED");
    lines.push("-".repeat(64));
    for (const type of manifest.missingDocuments) {
      const spec = getDocumentSpec(type);
      lines.push(`- ${spec.label} — ${spec.authority}`);
    }
    lines.push("");
  }

  if (manifest.notes) {
    lines.push("NOTES FROM THE SENDER");
    lines.push("-".repeat(64));
    lines.push(manifest.notes);
    lines.push("");
  }

  lines.push("-".repeat(64));
  lines.push(
    "Extracted values in this package were read by automated OCR and checked against the rules cited above. They are a working aid, not a substitute for the enclosed originals, which govern."
  );
  lines.push(`This package and its download link stop working at ${formatTimestamp(manifest.expiresAt)}.`);

  return lines.join("\n") + "\n";
}

// ─── HTML ─────────────────────────────────────────────────

const STATUS_COLORS = {
  cleared: { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" },
  blocked: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  warning: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
} as const;

/**
 * Inner markup only — no <html>/<body>. The broker-facing page embeds this so
 * the web view and the printable copy in the ZIP cannot drift apart.
 *
 * Every interpolation of manifest data goes through `escapeHtml`; the only raw
 * HTML is the literal template below. That is what makes it safe for the page
 * to inject with `dangerouslySetInnerHTML` — the manifest is user-influenced
 * data (file names, party names, sender notes) and is never trusted as markup.
 */
export function renderCoverSheetBodyHtml(manifest: HandoffManifest): string {
  const s = manifest.shipment;
  const tone = manifest.clearedToFile && !manifest.releasedWithBlockers ? "cleared" : "blocked";
  const colors = STATUS_COLORS[tone];

  const statusHeadline = manifest.releasedWithBlockers
    ? "Released with unresolved blockers"
    : manifest.clearedToFile
      ? "Cleared to file"
      : "Not cleared to file";

  const statusDetail = manifest.releasedWithBlockers
    ? `${manifest.blockerCount} blocking issue${manifest.blockerCount === 1 ? "" : "s"} were acknowledged, not fixed. Do not file against this set until they are resolved.`
    : manifest.clearedToFile
      ? "Every document validates and the set agrees with itself."
      : `${manifest.blockerCount} blocking issue${manifest.blockerCount === 1 ? "" : "s"} must be resolved before this entry is filed.`;

  const facts: Array<[string, string]> = [
    ["Reference", orDash(s.reference)],
    ["Bill of lading", orDash(s.blNumber)],
    ["Invoice", orDash(s.invoiceNumber)],
    ["Containers", s.containerNumbers.length ? s.containerNumbers.join(", ") : "not stated"],
    ["Vessel / voyage", `${orDash(s.vesselName)} / ${orDash(s.voyageNumber)}`],
    ["Carrier", orDash(s.carrier)],
    ["Load → discharge", `${orDash(s.portOfLoading)} → ${orDash(s.portOfDischarge)}`],
    ["ETD / ETA", `${formatDateOnly(s.etd)} / ${formatDateOnly(s.eta)}`],
    ["Shipper", orDash(s.shipper)],
    ["Consignee", orDash(s.consignee)],
    ["Country of origin", orDash(s.countryOfOrigin)],
    ["Incoterm", orDash(s.incoterm)],
    ["Declared value", formatMoney(s.declaredValue, s.currency)],
    ["HTS codes", s.htsCodes.length ? s.htsCodes.join(", ") : "not stated"],
    ["Gross weight", s.grossWeightKg === null ? "not agreed across documents" : `${s.grossWeightKg.toLocaleString("en-US")} kg`],
    ["Packages", s.packageCount === null ? "not agreed across documents" : s.packageCount.toLocaleString("en-US")],
  ];

  const actionRows = manifest.actionItems
    .map(
      (item) => `
        <li style="margin:0 0 10px;padding:12px 14px;border-radius:8px;border:1px solid ${
          item.severity === "blocker" ? STATUS_COLORS.blocked.border : STATUS_COLORS.warning.border
        };background:${
          item.severity === "blocker" ? STATUS_COLORS.blocked.bg : STATUS_COLORS.warning.bg
        };color:${
          item.severity === "blocker" ? STATUS_COLORS.blocked.text : STATUS_COLORS.warning.text
        };">
          <strong style="text-transform:uppercase;font-size:11px;letter-spacing:.06em;">${item.severity}</strong>
          <div style="margin-top:4px;">${escapeHtml(item.message)}</div>
        </li>`
    )
    .join("");

  const docRows = manifest.documents
    .map(
      (doc) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">
            <div style="font-weight:600;color:#0f172a;">${escapeHtml(doc.label)}</div>
            <div style="font-size:12px;color:${
              doc.archivePath ? "#64748b" : "#b45309"
            };margin-top:2px;">${escapeHtml(
              doc.archivePath ??
                `Not attached${doc.fileName ? ` (uploaded as ${doc.fileName})` : ""}`
            )}</div>
            ${
              doc.missingRequired.length
                ? `<div style="font-size:12px;color:#b45309;margin-top:4px;">Missing: ${escapeHtml(
                    doc.missingRequired.map((k) => fieldLabel(doc.type, k)).join(", ")
                  )}</div>`
                : ""
            }
            ${
              doc.lowConfidenceFields.length
                ? `<div style="font-size:12px;color:#b45309;margin-top:4px;">Verify against the original: ${escapeHtml(
                    doc.lowConfidenceFields.map((k) => fieldLabel(doc.type, k)).join(", ")
                  )}</div>`
                : ""
            }
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;white-space:nowrap;text-align:right;">
            <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:3px 8px;border-radius:999px;background:${
              doc.valid ? STATUS_COLORS.cleared.bg : STATUS_COLORS.blocked.bg
            };color:${doc.valid ? STATUS_COLORS.cleared.text : STATUS_COLORS.blocked.text};">
              ${doc.valid ? "validates" : `${doc.blockerCount} blocker${doc.blockerCount === 1 ? "" : "s"}`}
            </span>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">${Math.round(
              doc.completeness * 100
            )}% read</div>
          </td>
        </tr>`
    )
    .join("");

  return `<div style="max-width:760px;margin:0 auto;padding:32px 20px 56px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Customs broker handoff package</p>
  <h1 style="margin:0 0 6px;font-size:26px;line-height:1.2;">${escapeHtml(
    orDash(s.blNumber, orDash(s.reference, manifest.packageId))
  )}</h1>
  <p style="margin:0 0 20px;font-size:13px;color:#64748b;">
    Prepared ${escapeHtml(formatTimestamp(manifest.generatedAt))}${
      manifest.preparedBy.organization ? ` by ${escapeHtml(manifest.preparedBy.organization)}` : ""
    } · Link expires ${escapeHtml(formatTimestamp(manifest.expiresAt))}
  </p>

  <div style="border:1px solid ${colors.border};background:${colors.bg};color:${colors.text};border-radius:10px;padding:16px 18px;margin-bottom:24px;">
    <div style="font-size:16px;font-weight:700;">${escapeHtml(statusHeadline)}</div>
    <div style="font-size:14px;margin-top:4px;">${escapeHtml(statusDetail)}</div>
    ${
      manifest.warningCount
        ? `<div style="font-size:13px;margin-top:6px;opacity:.85;">${manifest.warningCount} warning${
            manifest.warningCount === 1 ? "" : "s"
          } to review — non-blocking.</div>`
        : ""
    }
  </div>

  ${
    actionRows
      ? `<h2 style="font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin:0 0 10px;">Action required</h2>
         <ul style="list-style:none;margin:0 0 28px;padding:0;font-size:14px;line-height:1.5;">${actionRows}</ul>`
      : ""
  }

  <h2 style="font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin:0 0 10px;">Shipment</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:12px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
    ${facts
      .map(
        ([key, value]) => `<tr>
          <th style="text-align:left;font-weight:500;color:#64748b;padding:9px 12px;border-bottom:1px solid #e2e8f0;width:38%;">${escapeHtml(
            key
          )}</th>
          <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;">${escapeHtml(value)}</td>
        </tr>`
      )
      .join("")}
  </table>
  <p style="font-size:12px;color:#64748b;margin:0 0 28px;">
    Anything shown as “not agreed across documents” is a value the documents state differently. It is left blank on purpose — the disagreement is in the action list.
  </p>

  <h2 style="font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin:0 0 10px;">Enclosed documents (${
    manifest.documents.length
  })</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:28px;">
    ${docRows}
  </table>

  ${
    manifest.missingDocuments.length
      ? `<h2 style="font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin:0 0 10px;">Required but not enclosed</h2>
         <ul style="font-size:14px;line-height:1.6;color:#991b1b;margin:0 0 28px;padding-left:20px;">${manifest.missingDocuments
           .map((type) => {
             const spec = getDocumentSpec(type);
             return `<li><strong>${escapeHtml(spec.label)}</strong> — ${escapeHtml(spec.authority)}</li>`;
           })
           .join("")}</ul>`
      : ""
  }

  ${
    manifest.notes
      ? `<h2 style="font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin:0 0 10px;">Notes from the sender</h2>
         <p style="font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0 0 28px;">${escapeHtml(
           manifest.notes
         )}</p>`
      : ""
  }

  <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 16px;">
  <p style="font-size:12px;color:#64748b;line-height:1.6;margin:0;">
    Extracted values were read by automated OCR and checked against the rules cited above. They are a working aid, not a substitute for the enclosed originals, which govern.
    This package and its download link stop working at ${escapeHtml(formatTimestamp(manifest.expiresAt))}.
  </p>
</div>`;
}

/** Standalone HTML document — the printable copy that ships inside the ZIP. */
export function renderCoverSheetHtml(manifest: HandoffManifest): string {
  const title = orDash(
    manifest.shipment.blNumber,
    orDash(manifest.shipment.reference, manifest.packageId)
  );
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Customs broker handoff — ${escapeHtml(title)}</title>
</head>
<body style="margin:0;background:#f8fafc;">
${renderCoverSheetBodyHtml(manifest)}
</body>
</html>`;
}
