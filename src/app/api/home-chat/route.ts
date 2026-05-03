import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/**
 * /api/home-chat — Public homepage chat endpoint.
 *
 * Powers the VercelV0Chat hero on the homepage. Uses claude-haiku-4-5
 * for cost (replies are short and conversational). Streams tokens back
 * as Server-Sent Events so the response renders progressively.
 *
 * NOT the same as /api/ai/chat — that one is the platform AI assistant
 * (tool-use, sonnet, authenticated). This one is intentionally minimal.
 */

// ─── Rate limiting (per-IP, in-memory) ──────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 8) return false;
  entry.count++;
  return true;
}

// ─── System prompt (per AI-8775 spec) ───────────────────────────────────────
const SYSTEM_PROMPT = `You are the Shipping Savior AI assistant. Help users with international shipping questions: carrier selection, FTZ savings, landed cost estimation, BOL extraction, route optimization. Keep replies under 3 sentences. If they ask about pricing/signup, guide to /pricing.`;

// ─── Model selection (spec: claude-haiku-4-5-20251001 for cost) ─────────────
const MODEL = "claude-haiku-4-5-20251001";

interface HomeChatBody {
  message?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
}

export async function POST(request: NextRequest) {
  // Rate limit
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Require API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Chat unavailable - API key not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse body — accept either { message } or { messages }
  let body: HomeChatBody;
  try {
    body = (await request.json()) as HomeChatBody;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: Anthropic.MessageParam[];

  if (Array.isArray(body.messages) && body.messages.length > 0) {
    messages = body.messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content }));
  } else if (typeof body.message === "string" && body.message.trim().length > 0) {
    messages = [{ role: "user", content: body.message.trim() }];
  } else {
    return new Response(
      JSON.stringify({ error: "message or messages[] required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "messages cannot be empty" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const client = new Anthropic({ apiKey });

  // Stream response back as SSE so the chat UI can render progressively
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: MODEL,
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", content: event.delta.text })}\n\n`
              )
            );
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream failed";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export const runtime = "nodejs";
