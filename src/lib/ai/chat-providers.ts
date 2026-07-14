/**
 * Multi-provider CHAT layer with tool-calling (AI-12777).
 *
 * The BOL/contract extraction layer (providers.ts) already falls back across
 * providers; chat was hardwired to Anthropic, so a single billing outage took
 * the assistant down on web and mobile. This module runs the same agentic
 * tool loop against whichever provider is funded, in order:
 *
 *   openrouter (DeepSeek by default) → gemini (2.5 Flash) → claude → kimi
 *
 * Override with CHAT_PROVIDER_ORDER, e.g. "claude,gemini". A provider is
 * skipped when its key is unset; a runtime failure (billing, 5xx) falls
 * through to the next. Model choices are env-tunable:
 *   OPENROUTER_CHAT_MODEL (default deepseek/deepseek-chat-v3-0324)
 *   GEMINI_CHAT_MODEL     (default gemini-2.5-flash)
 *   ANTHROPIC_CHAT_MODEL  (default claude-sonnet-4-20250514)
 *   KIMI_CHAT_MODEL       (default kimi-k2.6)
 */

import Anthropic from '@anthropic-ai/sdk';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ToolStep {
  tool: string;
  input: Record<string, unknown>;
  result: unknown;
}

export interface ChatResult {
  text: string;
  toolSteps: ToolStep[];
  provider: string;
}

interface RunOpts {
  system: string;
  messages: ChatMessage[];
  tools: Anthropic.Tool[];
  executeTool: (name: string, input: Record<string, any>) => unknown;
  maxIterations?: number;
  maxTokens?: number;
}

const DEFAULT_ORDER = ['openrouter', 'gemini', 'claude', 'kimi'] as const;
type Provider = (typeof DEFAULT_ORDER)[number];

// ─── OpenAI-compatible loop (OpenRouter, Kimi) ───────────────────────────────

interface OpenAiToolCall {
  id: string;
  function: { name: string; arguments: string };
}

async function runOpenAiCompatible(
  opts: RunOpts,
  provider: string,
  baseUrl: string,
  apiKey: string,
  model: string
): Promise<ChatResult> {
  const tools = opts.tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description ?? '',
      parameters: t.input_schema as Record<string, unknown>,
    },
  }));

  const messages: Array<Record<string, unknown>> = [
    { role: 'system', content: opts.system },
    ...opts.messages,
  ];
  const toolSteps: ToolStep[] = [];

  for (let i = 0; i < (opts.maxIterations ?? 5); i++) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: opts.maxTokens ?? 2048,
        messages,
        tools,
      }),
    });
    if (!res.ok) {
      throw new Error(`${provider} API error ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string | null; tool_calls?: OpenAiToolCall[] } }>;
      error?: { message?: string };
    };
    if (data.error) throw new Error(data.error.message ?? `${provider} error`);

    const msg = data.choices?.[0]?.message;
    const toolCalls = msg?.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return { text: msg?.content ?? '', toolSteps, provider };
    }

    messages.push({ role: 'assistant', content: msg?.content ?? null, tool_calls: toolCalls });
    for (const call of toolCalls) {
      let input: Record<string, any> = {};
      try {
        input = JSON.parse(call.function.arguments || '{}');
      } catch {
        // malformed args — run the tool with empty input and let it error meaningfully
      }
      const result = opts.executeTool(call.function.name, input);
      toolSteps.push({ tool: call.function.name, input, result });
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }
  throw new Error(`${provider}: too many tool iterations`);
}

// ─── Gemini loop ──────────────────────────────────────────────────────────────

async function runGemini(opts: RunOpts, apiKey: string, model: string): Promise<ChatResult> {
  // Gemini takes an OpenAPI-style schema; pass the JSON-schema fields it understands.
  const tools = [
    {
      functionDeclarations: opts.tools.map((t) => {
        const schema = t.input_schema as {
          type?: string;
          properties?: Record<string, unknown>;
          required?: string[];
        };
        return {
          name: t.name,
          description: t.description ?? '',
          parameters: {
            type: schema.type ?? 'object',
            properties: schema.properties ?? {},
            ...(schema.required?.length ? { required: schema.required } : {}),
          },
        };
      }),
    },
  ];

  const contents: Array<Record<string, unknown>> = opts.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const toolSteps: ToolStep[] = [];

  for (let i = 0; i < (opts.maxIterations ?? 5); i++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: opts.system }] },
          contents,
          tools,
          generationConfig: { maxOutputTokens: opts.maxTokens ?? 2048 },
        }),
      }
    );
    if (!res.ok) {
      throw new Error(`gemini API error ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<Record<string, any>> } }>;
      error?: { message?: string };
    };
    if (data.error) throw new Error(data.error.message ?? 'gemini error');

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const functionCalls = parts.filter((p) => p.functionCall);
    if (functionCalls.length === 0) {
      const text = parts.map((p) => p.text ?? '').join('');
      return { text, toolSteps, provider: 'gemini' };
    }

    contents.push({ role: 'model', parts: functionCalls });
    const responseParts: Array<Record<string, unknown>> = [];
    for (const p of functionCalls) {
      const { name, args } = p.functionCall as { name: string; args?: Record<string, any> };
      const result = opts.executeTool(name, args ?? {});
      toolSteps.push({ tool: name, input: args ?? {}, result });
      responseParts.push({ functionResponse: { name, response: { result } } });
    }
    contents.push({ role: 'user', parts: responseParts });
  }
  throw new Error('gemini: too many tool iterations');
}

// ─── Claude loop (previous inline behavior, unchanged semantics) ──────────────

async function runClaude(opts: RunOpts, apiKey: string, model: string): Promise<ChatResult> {
  const client = new Anthropic({ apiKey });
  let messages: Anthropic.MessageParam[] = opts.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const toolSteps: ToolStep[] = [];

  for (let i = 0; i < (opts.maxIterations ?? 5); i++) {
    const response = await client.messages.create({
      model,
      max_tokens: opts.maxTokens ?? 2048,
      system: opts.system,
      tools: opts.tools,
      messages,
    });

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ContentBlock & { type: 'tool_use' } => b.type === 'tool_use'
    );
    if (toolUseBlocks.length === 0) {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('');
      return { text, toolSteps, provider: 'claude' };
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const result = opts.executeTool(block.name, block.input as Record<string, any>);
      toolSteps.push({ tool: block.name, input: block.input as Record<string, unknown>, result });
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }
    messages = [
      ...messages,
      { role: 'assistant', content: response.content },
      { role: 'user', content: toolResults },
    ];
  }
  throw new Error('claude: too many tool iterations');
}

// ─── Fallback chain ───────────────────────────────────────────────────────────

function providerOrder(): Provider[] {
  const raw = process.env.CHAT_PROVIDER_ORDER;
  if (!raw) return [...DEFAULT_ORDER];
  const known = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is Provider => (DEFAULT_ORDER as readonly string[]).includes(s));
  return known.length ? known : [...DEFAULT_ORDER];
}

export async function runChatWithFallback(opts: RunOpts): Promise<ChatResult> {
  const errors: string[] = [];

  for (const provider of providerOrder()) {
    try {
      switch (provider) {
        case 'openrouter': {
          const key = process.env.OPENROUTER_API_KEY;
          if (!key) continue;
          return await runOpenAiCompatible(
            opts,
            'openrouter',
            'https://openrouter.ai/api/v1',
            key,
            process.env.OPENROUTER_CHAT_MODEL ?? 'deepseek/deepseek-chat-v3-0324'
          );
        }
        case 'gemini': {
          const key = process.env.GEMINI_API_KEY;
          if (!key) continue;
          return await runGemini(opts, key, process.env.GEMINI_CHAT_MODEL ?? 'gemini-2.5-flash');
        }
        case 'claude': {
          const key = process.env.ANTHROPIC_API_KEY;
          if (!key) continue;
          return await runClaude(
            opts,
            key,
            process.env.ANTHROPIC_CHAT_MODEL ?? 'claude-sonnet-4-20250514'
          );
        }
        case 'kimi': {
          const key = process.env.KIMI_API_KEY;
          if (!key) continue;
          return await runOpenAiCompatible(
            opts,
            'kimi',
            'https://api.moonshot.ai/v1',
            key,
            process.env.KIMI_CHAT_MODEL ?? 'kimi-k2.6'
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${provider}: ${msg}`);
      console.warn(`[ai/chat-providers] ${provider} failed: ${msg.slice(0, 160)}`);
    }
  }

  throw new Error(errors.at(-1) ?? 'No chat provider configured');
}
