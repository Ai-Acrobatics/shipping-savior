/**
 * POST /api/negotiation/analyze — AI-12020
 *
 * Score a carrier quote against the FBX market benchmark and return a full
 * negotiation package: grade, counter-offer ladder, leverage points and a
 * ready-to-send script.
 *
 * The analysis itself is pure and deterministic (see lib/negotiation). The
 * only optional network call is an LLM pass that rewrites the counter-offer
 * email in the shipper's own tone — and it degrades silently to the
 * deterministic template on any failure, because a negotiation script that
 * arrives is worth more than one that 500s.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import {
  analyzeQuote,
  LaneResolutionError,
  QuoteValidationError,
  type NegotiationAnalysis,
  type QuoteInput,
} from "@/lib/negotiation";

const lineItemSchema = z.object({
  code: z.string().min(1).max(40),
  label: z.string().max(120).optional(),
  amount: z.number().finite().min(0).max(1_000_000),
  perShipment: z.boolean().optional(),
});

const bodySchema = z.object({
  carrier: z.string().min(1).max(120),
  originPort: z.string().min(2).max(10),
  destPort: z.string().min(2).max(10),
  containerType: z.enum(["20GP", "40GP", "40HC", "20RF", "40RF"]),
  containerCount: z.number().int().min(1).max(10_000),
  baseRatePerContainer: z.number().finite().positive().max(1_000_000),
  lineItems: z.array(lineItemSchema).max(30).optional(),
  contractType: z.enum(["spot", "90_day", "180_day", "365_day"]).optional(),
  annualFeuVolume: z.number().finite().min(0).max(1_000_000).optional(),
  competingQuotes: z
    .array(
      z.object({
        carrier: z.string().min(1).max(120),
        ratePerContainer: z.number().finite().positive().max(1_000_000),
      })
    )
    .max(10)
    .optional(),
  flexibleDates: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  /** Opt in to the LLM tone pass on the email body. */
  polishWithAi: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid quote",
        details: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  const { polishWithAi, ...quote } = parsed.data;

  let analysis: NegotiationAnalysis;
  try {
    analysis = analyzeQuote(quote as QuoteInput);
  } catch (error) {
    // Both guard errors are the caller's problem, not ours — 400, with the
    // message, so the UI can point at the field the user has to fix.
    if (error instanceof QuoteValidationError || error instanceof LaneResolutionError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[negotiation/analyze] Unexpected failure:", error);
    return NextResponse.json({ error: "Failed to analyze quote" }, { status: 500 });
  }

  if (polishWithAi) {
    analysis = await polishEmail(analysis);
  }

  return NextResponse.json({ analysis });
}

/**
 * Rewrite the counter-offer email in a warmer, more natural voice WITHOUT
 * changing any number. The prompt is explicit about that because a
 * hallucinated rate in a live carrier negotiation is a real-money error.
 *
 * Never throws — on any failure the deterministic template stands.
 */
async function polishEmail(analysis: NegotiationAnalysis): Promise<NegotiationAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return analysis;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: [
            "You are editing a freight rate negotiation email written by a shipper to an ocean carrier.",
            "",
            "Rewrite it so it reads like a confident, experienced logistics manager wrote it: warm but direct, no filler, no corporate padding, no exclamation marks.",
            "",
            "HARD RULES:",
            "- Do NOT change, add, or remove any dollar figure, percentage, rate, port code, container type, index code, or date.",
            "- Do NOT invent leverage, volume, competing quotes, or commitments that are not already in the draft.",
            "- Keep every ask that is present in the draft.",
            "- Keep it under 220 words.",
            "- Return ONLY the rewritten email body. No preamble, no subject line, no markdown fences.",
            "",
            "DRAFT:",
            analysis.script.emailBody,
          ].join("\n"),
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    if (!text) return analysis;

    // Cheap integrity gate: every dollar figure in the deterministic draft
    // must survive into the rewrite. If the model dropped or altered one,
    // discard the rewrite rather than hand a shipper a wrong number.
    const figures = analysis.script.emailBody.match(/\$[\d,]+/g) ?? [];
    const allPreserved = figures.every((f) => text.includes(f));
    if (!allPreserved) {
      console.warn("[negotiation/analyze] AI polish dropped a figure — keeping the template.");
      return analysis;
    }

    return {
      ...analysis,
      script: { ...analysis.script, emailBody: text, aiPolished: true },
    };
  } catch (error) {
    console.warn(
      "[negotiation/analyze] AI polish failed, using deterministic template:",
      error instanceof Error ? error.message : error
    );
    return analysis;
  }
}
