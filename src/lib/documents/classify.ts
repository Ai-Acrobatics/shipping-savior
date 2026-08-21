// ============================================================
// Multi-document trade OCR — deterministic classification (AI-12016)
//
// The model is asked to name the document type, but its answer is checked
// against the raw text with a weighted keyword score. Two reasons:
//
//   1. A misclassified document is validated against the wrong rules, which
//      produces a confident "valid" on a document that was never checked.
//   2. Phytosanitary certificates and FDA Prior Notice confirmations look
//      superficially alike to a vision model — both are single-page
//      government forms with a reference number and a product description —
//      and they carry completely different statutory gates.
//
// So the classifier is pure, deterministic and cheap, and disagreement with
// the model is surfaced rather than silently resolved.
// ============================================================

import { DOCUMENT_SPECS, DOCUMENT_TYPES } from "./registry";
import type { ClassificationCandidate, ClassificationResult, TradeDocumentType } from "./types";

/** Score gap below which two candidates are treated as indistinguishable. */
export const AMBIGUITY_MARGIN = 0.2;

export function classifyDocumentText(rawText: string): ClassificationResult {
  const haystack = (rawText ?? "").toLowerCase();

  const candidates: ClassificationCandidate[] = DOCUMENT_TYPES.map((type) => {
    const spec = DOCUMENT_SPECS[type];
    const matched: string[] = [];
    let score = 0;
    for (const signal of spec.signals) {
      if (haystack.includes(signal.phrase)) {
        score += signal.weight;
        matched.push(signal.phrase);
      }
    }
    return { type, score, matched };
  }).sort((a, b) => b.score - a.score || a.type.localeCompare(b.type));

  const top = candidates[0];
  const runnerUp = candidates[1];

  if (!top || top.score === 0) {
    return { type: null, confidence: 0, candidates, ambiguous: false };
  }

  // Confidence is the winner's share of all evidence found, which punishes a
  // document that trips every type's signals as much as one that trips none.
  const totalScore = candidates.reduce((sum, c) => sum + c.score, 0);
  const share = totalScore > 0 ? top.score / totalScore : 0;
  const ambiguous =
    runnerUp !== undefined &&
    runnerUp.score > 0 &&
    (top.score - runnerUp.score) / top.score < AMBIGUITY_MARGIN;

  return {
    type: top.type,
    confidence: Number(share.toFixed(4)),
    candidates,
    ambiguous,
  };
}

/**
 * Reconcile the model's claimed type against the text-derived one.
 *
 * The model wins ties — it can read layout the keyword scorer cannot — but a
 * confident textual disagreement is returned as `conflict` so the caller can
 * surface it rather than validating against the wrong rulebook.
 */
export function resolveDocumentType(args: {
  requested?: TradeDocumentType | "auto";
  modelClaim?: string | null;
  rawText?: string | null;
}): {
  type: TradeDocumentType | null;
  source: "requested" | "model" | "text" | "none";
  classification: ClassificationResult;
  conflict: { modelClaim: TradeDocumentType; textClaim: TradeDocumentType } | null;
} {
  const classification = classifyDocumentText(args.rawText ?? "");
  const modelClaim = isKnownType(args.modelClaim) ? args.modelClaim : null;

  // An explicit request wins outright — the user told us what they uploaded.
  if (args.requested && args.requested !== "auto") {
    return { type: args.requested, source: "requested", classification, conflict: null };
  }

  const conflict =
    modelClaim !== null &&
    classification.type !== null &&
    classification.type !== modelClaim &&
    !classification.ambiguous &&
    classification.confidence >= 0.5
      ? { modelClaim, textClaim: classification.type }
      : null;

  if (modelClaim) {
    return { type: modelClaim, source: "model", classification, conflict };
  }
  if (classification.type) {
    return { type: classification.type, source: "text", classification, conflict: null };
  }
  return { type: null, source: "none", classification, conflict: null };
}

function isKnownType(value: unknown): value is TradeDocumentType {
  return typeof value === "string" && value in DOCUMENT_SPECS;
}
