'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolSteps?: ToolStep[];
  isStreaming?: boolean;
}

interface ToolStep {
  tool: string;
  input: any;
  result: any;
}

const TOOL_LABELS: Record<string, string> = {
  search_hts: 'Searching HTS codes',
  lookup_duty_rate: 'Looking up duty rates',
  search_schedules: 'Finding shipping schedules',
  find_carriers: 'Finding carriers',
  check_reliability: 'Checking reliability',
  search_ports: 'Searching ports',
  estimate_freight: 'Estimating freight costs',
  search_ftz_zones: 'Searching FTZ zones',
};

const SUGGESTED_PROMPTS = [
  "What's the duty rate for electronics from Vietnam?",
  'Compare carriers from Qingdao to Los Angeles',
  'How much would it cost to ship a 40ft container from Shanghai?',
  'What FTZ zones are near Los Angeles?',
];

// ─── Icons ───────────────────────────────────────────────────────────────────
function ShipIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
      <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
      <path d="M12 10V4.5" />
      <path d="M12 4.5L8 7" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ToolIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTools, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setInput('');
    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setActiveTools([]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantText = '';
      let toolSteps: ToolStep[] = [];
      const assistantId = `assistant-${Date.now()}`;

      // Add placeholder assistant message
      setMessages(prev => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', isStreaming: true },
      ]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'tool_steps') {
              toolSteps = data.steps;
              setActiveTools(data.steps.map((s: ToolStep) => s.tool));
            } else if (data.type === 'text') {
              assistantText += data.content;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: assistantText, toolSteps, isStreaming: true }
                    : m
                )
              );
            } else if (data.type === 'done') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: assistantText, toolSteps, isStreaming: false }
                    : m
                )
              );
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      setActiveTools([]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      // Remove placeholder if it was added
      setMessages(prev => prev.filter(m => !m.isStreaming || m.content));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating button — AI-6543 mobile: smaller + tighter inset so it stops overlapping demo card content ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group"
          title="Ask AI"
          aria-label="Open AI assistant"
        >
          <div className="relative">
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-ocean-500 to-indigo-500 animate-ping opacity-20" />
            {/* Button */}
            <div
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-lg
                         hover:scale-110 transition-transform duration-300"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #6366f1)',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
              }}
            >
              <ShipIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          {/* Tooltip */}
          <span
            className="absolute bottom-full right-0 mb-2 px-3 py-1.5 text-xs font-medium text-white
                       rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200
                       pointer-events-none whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}
          >
            Ask AI
          </span>
        </button>
      )}

      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed z-50 inset-0 sm:inset-auto sm:bottom-6 sm:right-6
                     sm:w-[480px] sm:h-[600px] sm:rounded-2xl
                     flex flex-col overflow-hidden
                     border border-navy-200/60 shadow-premium"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            animation: 'scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b border-navy-200/60"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(99,102,241,0.06))',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}
              >
                <ShipIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-navy-900">Shipping Savior AI</h3>
                <p className="text-xs text-navy-500">Logistics assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         text-navy-400 hover:text-navy-700 hover:bg-navy-100
                         transition-colors duration-200"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}
                >
                  <ShipIcon className="w-8 h-8" />
                </div>
                <h4 className="text-base font-semibold text-navy-900 mb-1">
                  How can I help?
                </h4>
                <p className="text-sm text-navy-500 mb-6">
                  Ask about tariffs, shipping routes, carriers, or FTZ zones.
                </p>
                <div className="grid gap-2 w-full">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-sm px-4 py-3 rounded-xl
                                 bg-navy-50 hover:bg-ocean-50 border border-navy-200/60
                                 hover:border-ocean-300 text-navy-700 hover:text-ocean-700
                                 transition-all duration-200"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(message => (
              <div key={message.id}>
                {/* Tool steps */}
                {message.toolSteps && message.toolSteps.length > 0 && (
                  <div className="mb-2 space-y-1.5">
                    {message.toolSteps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg
                                   bg-indigo-50 border border-indigo-100 text-xs"
                      >
                        <ToolIcon className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span className="text-indigo-700 font-medium">
                          {TOOL_LABELS[step.tool] || step.tool}
                        </span>
                        <span className="text-indigo-400 ml-auto">Done</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'text-white'
                        : 'bg-white/80 backdrop-blur border border-navy-200/60 text-navy-800 shadow-soft'
                    }`}
                    style={
                      message.role === 'user'
                        ? {
                            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.25)',
                          }
                        : undefined
                    }
                  >
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-ocean-500 animate-pulse rounded-sm" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Active tool indicators while loading */}
            {isLoading && activeTools.length > 0 && (
              <div className="space-y-1.5">
                {activeTools.map((tool, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg
                               bg-indigo-50 border border-indigo-100 text-xs"
                  >
                    <div className="w-3.5 h-3.5 flex-shrink-0">
                      <ToolIcon className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    </div>
                    <span className="text-indigo-700 font-medium">
                      {TOOL_LABELS[tool] || tool}...
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && activeTools.length === 0 && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-white/80 backdrop-blur border border-navy-200/60 shadow-soft">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-ocean-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-ocean-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-ocean-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="px-4 pb-4 pt-2 border-t border-navy-200/40">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about tariffs, routes, carriers..."
                disabled={isLoading}
                className="flex-1 bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm
                           text-navy-900 placeholder:text-navy-400
                           focus:outline-none focus:ring-2 focus:ring-ocean-500/40 focus:border-ocean-500
                           disabled:opacity-50 transition-all duration-200"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white
                           disabled:opacity-40 transition-all duration-200
                           hover:scale-105 active:scale-95"
                style={{
                  background:
                    input.trim() && !isLoading
                      ? 'linear-gradient(135deg, #2563eb, #6366f1)'
                      : '#94a3b8',
                  boxShadow:
                    input.trim() && !isLoading
                      ? '0 2px 10px rgba(37, 99, 235, 0.3)'
                      : 'none',
                }}
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
