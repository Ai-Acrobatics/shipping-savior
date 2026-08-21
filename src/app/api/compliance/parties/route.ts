/**
 * GET /api/compliance/parties?name=... — AI-12017
 *
 * Single-name denied-party lookup, for the "can we even quote this
 * counterparty?" question that comes before a shipment exists.
 *
 * Always returns the list coverage alongside the hits. A caller that renders
 * "no matches" without the coverage line is making a stronger statement than
 * the data supports, so the data makes that hard to do by accident.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadScreeningLists } from "@/lib/data/denied-parties";
import { screenName } from "@/lib/compliance";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const name = new URL(request.url).searchParams.get("name")?.trim() ?? "";
  if (name.length < 2) {
    return NextResponse.json(
      { error: 'Query parameter "name" is required (2 characters minimum)' },
      { status: 400 }
    );
  }
  if (name.length > 300) {
    return NextResponse.json({ error: "Name is too long to screen" }, { status: 400 });
  }

  const { entries, coverage } = loadScreeningLists();
  const matches = screenName(name, entries).slice(0, 25);

  return NextResponse.json({
    query: name,
    matchCount: matches.length,
    matches: matches.map((match) => ({
      name: match.entry.name,
      source: match.entry.source,
      program: match.entry.program,
      countries: match.entry.countries,
      citation: match.entry.citation,
      remarks: match.entry.remarks,
      scorePct: match.scorePct,
      strength: match.strength,
      matchedAgainst: match.matchedAgainst,
    })),
    coverage,
  });
}
