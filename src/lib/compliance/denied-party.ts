// ============================================================
// Denied-party + sanctioned-jurisdiction screening (AI-12017)
//
// Two independent exposures, screened together because a shipper thinks of
// them as one question ("can I deal with this counterparty?"):
//
//   1. Is the party (or one of its aliases) on a restricted-party list?
//   2. Is the party sitting in a jurisdiction or region that is itself
//      restricted, regardless of who they are?
//
// The second one has no fuzzy matching and no judgement calls, which is
// precisely why it is easy to forget.
// ============================================================

import {
  getSanctionedJurisdiction,
  loadScreeningLists,
  RESTRICTED_REGION_INDICATORS,
} from "@/lib/data/denied-parties";
import { nameMatchScore, strengthFor, MATCH_THRESHOLDS } from "./name-match";
import type {
  DeniedPartyHit,
  DeniedPartyScreenResult,
  MatchStrength,
  ScreeningListEntry,
  ScreeningParty,
} from "./types";

/**
 * Screen one name against the loaded lists.
 *
 * Returns every entry at or above the "possible" threshold, best first. All of
 * them, not just the top one: a name can plausibly match two different listed
 * entities and an analyst needs to clear both.
 */
export function screenName(
  name: string,
  entries: ScreeningListEntry[] = loadScreeningLists().entries
): { entry: ScreeningListEntry; scorePct: number; strength: MatchStrength; matchedAgainst: string }[] {
  const trimmed = name?.trim();
  if (!trimmed) return [];

  const results: {
    entry: ScreeningListEntry;
    scorePct: number;
    strength: MatchStrength;
    matchedAgainst: string;
  }[] = [];

  for (const entry of entries) {
    const candidates = [entry.name, ...(entry.aliases ?? [])];
    let best = 0;
    let bestCandidate = entry.name;

    for (const candidate of candidates) {
      const score = nameMatchScore(trimmed, candidate);
      if (score > best) {
        best = score;
        bestCandidate = candidate;
      }
    }

    if (best >= MATCH_THRESHOLDS.possible) {
      const strength = strengthFor(best);
      if (strength !== "none") {
        results.push({ entry, scorePct: best, strength, matchedAgainst: bestCandidate });
      }
    }
  }

  return results.sort((a, b) => b.scorePct - a.scorePct);
}

/**
 * Full party screen across the whole shipment.
 *
 * Manufacturer names carried on line items are screened too — they are often
 * the only place the actual factory appears, and the factory is the entity
 * UFLPA and the Entity List care about. Those are folded in by the caller via
 * `extraNames`, keyed back to the party index they belong to.
 */
export function screenParties(
  parties: ScreeningParty[],
  entries: ScreeningListEntry[] = loadScreeningLists().entries
): DeniedPartyScreenResult {
  const hits: DeniedPartyHit[] = [];
  const jurisdictionHits: DeniedPartyScreenResult["jurisdictionHits"] = [];

  parties.forEach((party, partyIndex) => {
    for (const match of screenName(party.name, entries)) {
      hits.push({
        partyIndex,
        partyName: party.name,
        partyRole: party.role,
        entry: match.entry,
        scorePct: match.scorePct,
        strength: match.strength,
        matchedAgainst: match.matchedAgainst,
      });
    }

    const jurisdiction = getSanctionedJurisdiction(party.country);
    if (jurisdiction) {
      jurisdictionHits.push({
        partyIndex,
        partyName: party.name,
        country: jurisdiction.code,
        countryName: jurisdiction.name,
        programme: jurisdiction.programme,
        embargoType: jurisdiction.embargoType,
      });
    }

    // Region-level restrictions live in the address, not the country code —
    // a Crimea address still reads "UA" or "RU" on the paperwork.
    const address = (party.address ?? "").toUpperCase();
    if (address) {
      for (const region of RESTRICTED_REGION_INDICATORS) {
        if (address.includes(region.indicator)) {
          jurisdictionHits.push({
            partyIndex,
            partyName: party.name,
            country: region.indicator,
            countryName: region.label,
            programme: region.programme,
            embargoType: "region",
          });
        }
      }
    }
  });

  // Strongest first so the UI's first row is the one that decides the verdict.
  hits.sort((a, b) => b.scorePct - a.scorePct);

  return { hits, partiesScreened: parties.length, jurisdictionHits };
}

/**
 * A hit at "probable" or better stops the shipment. "Possible" does not — it
 * has to be cleared by a human, but auto-blocking on a 78% token overlap would
 * make the agent unusable and train people to ignore it.
 */
export function isBlockingHit(hit: DeniedPartyHit): boolean {
  return hit.strength === "exact" || hit.strength === "strong" || hit.strength === "probable";
}
