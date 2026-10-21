import { describe, it, expect, vi, beforeEach } from 'vitest';

const authMock = vi.fn();
const runChatMock = vi.fn();
const loadHistoryMock = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));
vi.mock('@/lib/ai/chat-providers', () => ({ runChatWithFallback: (o: unknown) => runChatMock(o) }));
vi.mock('@/lib/shipments/history-stats', () => ({
  loadShippingHistory: (...a: unknown[]) => loadHistoryMock(...a),
}));

import { POST } from './route';

function req(ip: string) {
  return new Request('http://localhost/api/ai/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'how many loads did we ship?' }] }),
  }) as any;
}

describe('POST /api/ai/chat — shipping history tool (AI-8060)', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test';
    authMock.mockReset();
    runChatMock.mockReset().mockResolvedValue({ text: 'ok', toolSteps: [] });
    loadHistoryMock.mockReset().mockResolvedValue({ totalShipments: 3 });
  });

  it('does not expose the history tool to anonymous users', async () => {
    authMock.mockResolvedValue(null);
    const res = await POST(req('10.0.0.1'));
    expect(res.status).toBe(200);
    const opts = runChatMock.mock.calls[0][0];
    expect(opts.tools.map((t: { name: string }) => t.name)).not.toContain('get_my_shipping_history');
    expect(await opts.executeTool('get_my_shipping_history', {})).toEqual({
      error: 'Sign in to an organization to see your shipping history.',
    });
    expect(loadHistoryMock).not.toHaveBeenCalled();
  });

  it('exposes the tool and scopes it to the session org, ignoring model-supplied orgId', async () => {
    authMock.mockResolvedValue({ user: { orgId: 'org-123' } });
    await POST(req('10.0.0.2'));
    const opts = runChatMock.mock.calls[0][0];
    expect(opts.tools.map((t: { name: string }) => t.name)).toContain('get_my_shipping_history');
    const result = await opts.executeTool('get_my_shipping_history', { orgId: 'evil', windowDays: 30 });
    expect(result).toEqual({ totalShipments: 3 });
    expect(loadHistoryMock).toHaveBeenCalledWith('org-123', { orgId: 'evil', windowDays: 30 });
  });

  it('returns a safe error when the history query fails', async () => {
    authMock.mockResolvedValue({ user: { orgId: 'org-123' } });
    loadHistoryMock.mockRejectedValue(new Error('db down'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await POST(req('10.0.0.3'));
    const opts = runChatMock.mock.calls[0][0];
    expect(await opts.executeTool('get_my_shipping_history', {})).toEqual({
      error: 'Shipping history is temporarily unavailable.',
    });
    spy.mockRestore();
  });

  it('still answers when auth itself throws', async () => {
    authMock.mockRejectedValue(new Error('no secret'));
    const res = await POST(req('10.0.0.4'));
    expect(res.status).toBe(200);
  });
});
