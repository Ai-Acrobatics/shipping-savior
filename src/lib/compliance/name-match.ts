// ============================================================
// Denied-party name matching (AI-12017)
//
// Sanctions screening is a fuzzy-match problem with an asymmetric cost:
// a missed hit is a strict-liability violation, a false hit is ten minutes of
// analyst time. Everything here is tuned in that direction — recall first,
// then let the strength band carry the precision signal so the UI can present
// a "possible" hit as something to clear rather than something to fear.
//
// Pure and deterministic. No network, no LLM. A model that hallucinates a
// non-match here produces a violation, so this stays arithmetic.
// ============================================================

/**
 * Legal-form suffixes. Stripped because "Hoshine Silicon Industry Co., Ltd."
 * and "Hoshine Silicon Industry" are the same company, and a shipper will type
 * whichever one is on the invoice.
 *
 * Only legal forms are stripped. Descriptive words ("Trading", "Silicon",
 * "Shipping") are load-bearing — dropping them collapses distinct companies
 * into each other and buries a real hit in noise.
 */
const LEGAL_FORM_TOKENS = new Set([
  "CO", "COMPANY", "CORP", "CORPORATION", "INC", "INCORPORATED",
  "LTD", "LIMITED", "LLC", "LLP", "LP", "PLC", "PT", "PTE", "PVT",
  "GMBH", "MBH", "AG", "KG", "SA", "SAS", "SARL", "SPA", "SRL", "NV", "BV",
  "AB", "AS", "OY", "OYJ", "JSC", "OJSC", "PJSC", "OOO", "ZAO", "PAO",
  "KFT", "DOO", "SDN", "BHD", "AD", "DD", "EOOD", "OOD",
  "THE", "AND",
]);

/** Latin-1 / common transliteration fold, then strip everything non-alphanumeric. */
export function normalizeName(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function nameTokens(raw: string): string[] {
  return normalizeName(raw)
    .split(" ")
    .filter((token) => token.length > 0 && !LEGAL_FORM_TOKENS.has(token));
}

/**
 * Jaro-Winkler similarity, 0..1.
 *
 * Chosen over plain Levenshtein because transliterated names differ by
 * character-level noise near the middle of the string ("Sovcomflot" /
 * "Sovkomflot") while sharing a prefix — which is exactly what the Winkler
 * prefix bonus rewards.
 */
export function jaroWinkler(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const matchWindow = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aMatched = new Array<boolean>(a.length).fill(false);
  const bMatched = new Array<boolean>(b.length).fill(false);

  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatched[j] || a[i] !== b[j]) continue;
      aMatched[i] = true;
      bMatched[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatched[i]) continue;
    while (!bMatched[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  transpositions /= 2;

  const jaro =
    (matches / a.length + matches / b.length + (matches - transpositions) / matches) / 3;

  // Winkler prefix bonus, capped at 4 characters per the original definition.
  let prefix = 0;
  for (let i = 0; i < Math.min(4, a.length, b.length); i++) {
    if (a[i] !== b[i]) break;
    prefix++;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

/**
 * Token-set similarity: every query token is greedily paired with its best
 * unused candidate token, and the pair scores contribute in proportion to
 * token length so a shared distinctive word outweighs a shared short one.
 *
 * This is what catches "Hikvision Digital" inside "Hangzhou Hikvision Digital
 * Technology Co Ltd" — a case where whole-string Jaro-Winkler scores poorly
 * because of the length gap.
 */
export function tokenSetSimilarity(queryTokens: string[], candidateTokens: string[]): number {
  if (queryTokens.length === 0 || candidateTokens.length === 0) return 0;

  const used = new Array<boolean>(candidateTokens.length).fill(false);
  let weighted = 0;
  let weight = 0;

  for (const token of queryTokens) {
    let best = 0;
    let bestIndex = -1;
    for (let i = 0; i < candidateTokens.length; i++) {
      if (used[i]) continue;
      const score = jaroWinkler(token, candidateTokens[i]);
      if (score > best) {
        best = score;
        bestIndex = i;
      }
    }
    if (bestIndex >= 0 && best >= 0.85) used[bestIndex] = true;
    // Sub-threshold pairings still contribute their (low) score rather than
    // zero, so "one word off" degrades smoothly instead of falling off a cliff.
    weighted += best * token.length;
    weight += token.length;
  }

  const forward = weight === 0 ? 0 : weighted / weight;

  // Penalise the case where the query is a short fragment of a much longer
  // listed name ("Group" vs "Xinjiang Production and Construction Corps"):
  // high forward coverage, but almost none of the listed entity is accounted
  // for. Only bites when the query is genuinely tiny relative to the candidate.
  const coverage = Math.min(1, queryTokens.length / candidateTokens.length);
  const coveragePenalty = coverage >= 0.5 ? 1 : 0.75 + coverage * 0.5;

  return forward * coveragePenalty;
}

export type MatchStrengthBand = "exact" | "strong" | "probable" | "possible" | "none";

/** Score thresholds, expressed once so the engine and the tests agree. */
export const MATCH_THRESHOLDS = {
  exact: 100,
  strong: 92,
  probable: 85,
  possible: 78,
} as const;

export function strengthFor(scorePct: number): MatchStrengthBand {
  if (scorePct >= MATCH_THRESHOLDS.exact) return "exact";
  if (scorePct >= MATCH_THRESHOLDS.strong) return "strong";
  if (scorePct >= MATCH_THRESHOLDS.probable) return "probable";
  if (scorePct >= MATCH_THRESHOLDS.possible) return "possible";
  return "none";
}

/**
 * Score a typed party name against one listed name. 0-100.
 *
 * Takes the better of whole-string and token-set similarity: the two fail in
 * different places (word order vs. length mismatch) and screening wants the
 * optimistic read, because the cost of the miss is the violation.
 */
export function nameMatchScore(query: string, candidate: string): number {
  const normQuery = normalizeName(query);
  const normCandidate = normalizeName(candidate);
  if (!normQuery || !normCandidate) return 0;
  if (normQuery === normCandidate) return 100;

  const queryTokens = nameTokens(query);
  const candidateTokens = nameTokens(candidate);

  // Equal after legal-form stripping — "Sberbank" vs "Sberbank Ltd".
  if (
    queryTokens.length > 0 &&
    queryTokens.join(" ") === candidateTokens.join(" ")
  ) {
    return 100;
  }

  const whole = jaroWinkler(normQuery, normCandidate);
  const tokenSet = tokenSetSimilarity(queryTokens, candidateTokens);

  // Containment: the full listed name appearing inside the typed name (or the
  // reverse) after stripping is a real hit that both metrics under-score.
  const strippedQuery = queryTokens.join(" ");
  const strippedCandidate = candidateTokens.join(" ");
  const contained =
    strippedQuery.length > 0 &&
    strippedCandidate.length > 0 &&
    (strippedQuery.includes(strippedCandidate) || strippedCandidate.includes(strippedQuery));

  const best = Math.max(whole, tokenSet, contained ? 0.94 : 0);
  return Math.round(best * 1000) / 10;
}
