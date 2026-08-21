// ============================================================
// Negotiation script generation (AI-12020)
//
// Deterministic, data-grounded output: every number in the script traces back
// to the benchmark or the quote. No LLM required — an optional polish pass
// lives in the API route and degrades to this template on any failure.
// ============================================================

import type {
  CounterOfferPlan,
  LaneBenchmark,
  LeveragePoint,
  NegotiationScript,
  QuoteInput,
  QuoteScore,
} from "./types";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

const CONTAINER_LABELS: Record<string, string> = {
  "20GP": "20ft standard",
  "40GP": "40ft standard",
  "40HC": "40ft high cube",
  "20RF": "20ft reefer",
  "40RF": "40ft reefer",
};

function laneLine(quote: QuoteInput): string {
  return `${quote.originPort.toUpperCase()} → ${quote.destPort.toUpperCase()}`;
}

export function buildEmailSubject(quote: QuoteInput, score: QuoteScore): string {
  const lane = laneLine(quote);
  if (score.verdict === "accept") {
    return `${lane} — confirming your ${quote.containerType} rate`;
  }
  return `${lane} — ${quote.containerType} rate revision request`;
}

export function buildEmailBody(
  quote: QuoteInput,
  benchmark: LaneBenchmark,
  score: QuoteScore,
  plan: CounterOfferPlan,
  leverage: LeveragePoint[]
): string {
  const lane = laneLine(quote);
  const containerLabel = CONTAINER_LABELS[quote.containerType] ?? quote.containerType;
  const opening = plan.rounds[0]!;

  if (score.verdict === "accept") {
    return [
      `Hi ${quote.carrier} team,`,
      ``,
      `Thanks for the ${lane} quote at ${usd(score.allInPerContainer)} all-in per ${containerLabel}.`,
      ``,
      `That prices below the current market for this lane (${benchmark.lane.code} 4-week average is ${usd(benchmark.percentiles.p50)} per ${containerLabel}), so we are happy to proceed.`,
      ``,
      `Please send the booking confirmation and the rate validity window, and confirm the quoted surcharges are fixed for the term.`,
      ``,
      `Best regards,`,
    ].join("\n");
  }

  const lines: string[] = [];

  lines.push(`Hi ${quote.carrier} team,`);
  lines.push(``);
  lines.push(
    `Thanks for the ${lane} quote — ${usd(score.allInPerContainer)} all-in per ${containerLabel}${
      quote.containerCount > 1 ? ` across ${quote.containerCount} containers` : ""
    }.`
  );
  lines.push(``);
  lines.push(
    `Before we book, we benchmarked it. Against ${benchmark.lane.code} (${benchmark.lane.label}) the 4-week market average is ${usd(
      benchmark.percentiles.p50
    )} per ${containerLabel}, which puts your number roughly ${Math.abs(Math.round(score.variancePct))}% ${
      score.variancePct >= 0 ? "above" : "below"
    } market.`
  );

  if (benchmark.trend.direction === "falling") {
    lines.push(
      `The index is also trending down — spot is ${Math.abs(benchmark.trend.vs4WeekPct).toFixed(1)}% under the 4-week average right now.`
    );
  }

  lines.push(``);
  lines.push(`We would like to work with you on this lane. Our ask:`);
  lines.push(``);
  lines.push(`  • ${usd(opening.ratePerContainer)} all-in per ${containerLabel}`);

  if (score.surchargeFindings.length > 0) {
    const list = score.surchargeFindings
      .map((f) => `${f.code} at ${usd(f.quoted)} vs a typical ceiling of ${usd(f.typicalMax)}`)
      .join("; ");
    lines.push(`  • Surcharges brought back inside standard ranges — ${list}`);
  }

  lines.push(`  • Rate held firm for the ${contractTermLabel(quote.contractType)}`);
  lines.push(``);

  // What we're putting on the table. Only real, stated concessions.
  const offers: string[] = [];
  if (quote.annualFeuVolume && quote.annualFeuVolume > 0) {
    offers.push(
      `a written minimum-quantity commitment of ${quote.annualFeuVolume.toLocaleString("en-US")} FEU/year`
    );
  }
  if (quote.flexibleDates) {
    offers.push("sailing-date flexibility of +/- 7 days so you can fill soft vessels");
  }
  if (quote.contractType === "365_day" || quote.contractType === "180_day") {
    offers.push(`a ${contractTermLabel(quote.contractType)} commitment rather than spot bookings`);
  }

  if (offers.length > 0) {
    lines.push(`In return we can offer ${joinList(offers)}.`);
    lines.push(``);
  }

  const competing = leverage.find((l) => l.key === "competing-bid" && l.strength === "high");
  if (competing) {
    lines.push(
      `To be transparent: we do have a live quote on this lane below yours, and we would rather consolidate with you than split the volume.`
    );
    lines.push(``);
  }

  lines.push(
    `If you can get to ${usd(plan.targetRatePerContainer)} we can commit this week. Let me know what you can do.`
  );
  lines.push(``);
  lines.push(`Best regards,`);

  return lines.join("\n");
}

function contractTermLabel(t: QuoteInput["contractType"]): string {
  switch (t) {
    case "365_day":
      return "12-month term";
    case "180_day":
      return "180-day term";
    case "90_day":
      return "90-day term";
    case "spot":
      return "spot booking";
    default:
      return "contract term";
  }
}

function joinList(items: string[]): string {
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function buildCallTalkingPoints(
  quote: QuoteInput,
  benchmark: LaneBenchmark,
  score: QuoteScore,
  plan: CounterOfferPlan,
  leverage: LeveragePoint[]
): string[] {
  const containerLabel = CONTAINER_LABELS[quote.containerType] ?? quote.containerType;
  const points: string[] = [];

  points.push(
    `Open with the lane, not the price: "We're looking at ${laneLine(quote)}, ${quote.containerCount} x ${containerLabel}${
      quote.annualFeuVolume ? `, roughly ${quote.annualFeuVolume.toLocaleString("en-US")} FEU a year` : ""
    }."`
  );

  if (score.verdict === "accept") {
    points.push(
      `Their number (${usd(score.allInPerContainer)}) is already below the ${benchmark.lane.code} market of ${usd(
        benchmark.percentiles.p50
      )}. Do not counter — lock the rate and the validity window instead.`
    );
    points.push(
      `Ask what it takes to hold this rate for a longer term. A good rate you cannot repeat is worth less than a fair rate you can.`
    );
    return points;
  }

  points.push(
    `Anchor with the index before they anchor with their tariff: "${benchmark.lane.code} is running ${usd(
      benchmark.percentiles.p50
    )} on a 4-week average — you're at ${usd(score.allInPerContainer)}."`
  );

  points.push(
    `Open at ${usd(plan.rounds[0]!.ratePerContainer)}. Say the number and then stop talking — the next person to speak concedes.`
  );

  for (const l of leverage.filter((x) => x.strength === "high").slice(0, 3)) {
    points.push(`${l.title}: ${l.detail}`);
  }

  if (score.surchargeFindings.length > 0) {
    points.push(
      `If the base rate is genuinely frozen, pivot to surcharges — there is ${usd(
        score.surchargeExcessTotal
      )}/container of padding there, and a rep can usually move those without pricing-desk approval.`
    );
  }

  points.push(
    `Landing zone is ${usd(plan.targetRatePerContainer)}. Walk-away is ${usd(
      plan.walkAwayRatePerContainer
    )} — above that, re-bid the lane rather than sign.`
  );

  points.push(
    `Close with a deadline: "If we can agree by Friday we'll commit the volume." Urgency without a date is not urgency.`
  );

  return points;
}

export function buildObjectionHandling(
  quote: QuoteInput,
  benchmark: LaneBenchmark,
  score: QuoteScore,
  plan: CounterOfferPlan
): Array<{ objection: string; response: string }> {
  const containerLabel = CONTAINER_LABELS[quote.containerType] ?? quote.containerType;

  const handlers: Array<{ objection: string; response: string }> = [
    {
      objection: '"That rate is below our cost."',
      response:
        `"I understand you have a floor. ${benchmark.lane.code} is averaging ${usd(
          benchmark.percentiles.p50
        )} per ${containerLabel} over four weeks and the 52-week low on this lane is ${usd(
          benchmark.spotPerContainer.low52Week
        )} — so the market clears well under where you've quoted. Which part of the number is fixed and which part can move?"`,
    },
    {
      objection: '"Rates are going up next month."',
      response:
        benchmark.trend.direction === "rising"
          ? `"Agreed, the index is firming — which is exactly why I want to fix a longer term now rather than ride the spot market. Give me the rate and I'll give you the length."`
          : `"The index doesn't show that. Spot is ${
              benchmark.trend.vs4WeekPct <= 0 ? "below" : "roughly at"
            } the 4-week average on this lane. If you're expecting an increase, fix my rate now and we both win."`,
    },
    {
      objection: '"This is our best rate / it\'s already discounted."',
      response:
        `"Then let's not fight over the base rate. Show me the surcharge breakdown${
          score.surchargeFindings.length > 0
            ? ` — ${score.surchargeFindings[0]!.code} is quoted at ${usd(
                score.surchargeFindings[0]!.quoted
              )} against a typical ceiling of ${usd(score.surchargeFindings[0]!.typicalMax)}`
            : ""
        }, and tell me what a longer term or an MQC would unlock."`,
    },
    {
      objection: '"We can\'t match that — someone is buying market share."',
      response:
        `"I'm not asking you to match the cheapest quote on the table. I'm asking you to price at market, which is ${usd(
          plan.targetRatePerContainer
        )} for the commitment I'm offering. Service reliability is worth a premium to me; ${Math.abs(
          Math.round(score.variancePct)
        )}% over market is not."`,
    },
    {
      objection: '"Let me check with my pricing desk." (stall)',
      response:
        `"Of course. So they have everything: ${usd(plan.rounds[0]!.ratePerContainer)} all-in per ${containerLabel}${
          quote.annualFeuVolume
            ? `, against ${quote.annualFeuVolume.toLocaleString("en-US")} FEU/year committed`
            : ""
        }. What day this week can you come back to me?"`,
    },
  ];

  return handlers;
}

export function buildBatna(
  quote: QuoteInput,
  benchmark: LaneBenchmark,
  plan: CounterOfferPlan
): string {
  const containerLabel = CONTAINER_LABELS[quote.containerType] ?? quote.containerType;
  const competing = quote.competingQuotes ?? [];
  const best =
    competing.length > 0
      ? competing.reduce((a, b) => (a.ratePerContainer <= b.ratePerContainer ? a : b))
      : null;

  // A competing quote is only a BATNA if it is actually better than walking.
  // A quote ABOVE the walk-away is not a fallback — telling the shipper they
  // "are not stuck" when their only alternative is more expensive hands them
  // leverage they do not have, and carriers call that bluff.
  if (best && best.ratePerContainer <= plan.walkAwayRatePerContainer) {
    return (
      `Your walk-away is ${usd(plan.walkAwayRatePerContainer)} per ${containerLabel}. You already hold a ` +
      `${best.carrier} quote at ${usd(best.ratePerContainer)}, so above the walk-away you are not stuck — ` +
      `you are choosing to overpay. Say the walk-away out loud only once, and mean it.`
    );
  }

  if (best) {
    return (
      `Your walk-away is ${usd(plan.walkAwayRatePerContainer)} per ${containerLabel}. Be honest with yourself ` +
      `about the fallback: your ${best.carrier} quote at ${usd(best.ratePerContainer)} is ABOVE that walk-away, ` +
      `so it is not a real alternative — right now you have no BATNA on this lane. Get two more quotes before ` +
      `you hold the line, because a walk-away you cannot actually execute is a bluff and carriers can tell.`
    );
  }

  return (
    `Your walk-away is ${usd(plan.walkAwayRatePerContainer)} per ${containerLabel} — just above the ` +
    `${benchmark.lane.code} market median. Above that number, put the lane out to bid with two more carriers ` +
    `rather than signing. Get a second quote before this call if you can: a BATNA you have not verified is a bluff, ` +
    `and carriers can tell.`
  );
}

export function buildScript(
  quote: QuoteInput,
  benchmark: LaneBenchmark,
  score: QuoteScore,
  plan: CounterOfferPlan,
  leverage: LeveragePoint[]
): NegotiationScript {
  return {
    emailSubject: buildEmailSubject(quote, score),
    emailBody: buildEmailBody(quote, benchmark, score, plan, leverage),
    callTalkingPoints: buildCallTalkingPoints(quote, benchmark, score, plan, leverage),
    objectionHandling: buildObjectionHandling(quote, benchmark, score, plan),
    batna: buildBatna(quote, benchmark, plan),
    aiPolished: false,
  };
}
