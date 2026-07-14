import { NextRequest } from "next/server";
import { classifyAiError, logAiError } from "@/lib/ai/errors";
import { runChatWithFallback } from "@/lib/ai/chat-providers";

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

  // AI-12777: any funded provider key will do — the fallback chain picks it.
  if (
    !process.env.OPENROUTER_API_KEY &&
    !process.env.GEMINI_API_KEY &&
    !process.env.ANTHROPIC_API_KEY &&
    !process.env.KIMI_API_KEY
  ) {
    return new Response(
      JSON.stringify({ error: "Chat unavailable - no AI provider configured." }),
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

  let messages: Array<{ role: "user" | "assistant"; content: string }>;

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

  // Stream response back as SSE so the chat UI can render progressively.
  // AI-12777: replies come from the provider-fallback chain (no tools here —
  // the homepage chat is intentionally minimal); chunked for the typing effect.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { text } = await runChatWithFallback({
          system: SYSTEM_PROMPT,
          messages,
          tools: [],
          executeTool: () => ({}),
          maxTokens: 512,
        });

        const chunkSize = 16;
        for (let i = 0; i < text.length; i += chunkSize) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "text", content: text.slice(i, i + chunkSize) })}\n\n`
            )
          );
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      } catch (err) {
        // AI-8506: classify provider errors so the homepage chat shows a
        // user-safe message (not the raw "credit balance is too low" string).
        const classified = classifyAiError(err);
        logAiError("home-chat", classified);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: classified.userMessage, code: classified.code })}\n\n`
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
