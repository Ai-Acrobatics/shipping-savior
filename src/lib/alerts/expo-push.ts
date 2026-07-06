/**
 * Minimal Expo Push API client (https://docs.expo.dev/push-notifications/sending-notifications/).
 * No SDK dependency — one POST per ≤100-message batch. Returns per-token
 * outcomes so the caller can prune DeviceNotRegistered tokens.
 */

export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
  channelId?: string;
}

export interface ExpoPushOutcome {
  token: string;
  ok: boolean;
  /** Expo error code when not ok, e.g. 'DeviceNotRegistered'. */
  error?: string;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100;

export async function sendExpoPushes(
  messages: ExpoPushMessage[]
): Promise<ExpoPushOutcome[]> {
  const outcomes: ExpoPushOutcome[] = [];

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(batch),
      });
      const json = (await res.json()) as {
        data?: Array<{ status: string; details?: { error?: string } }>;
      };
      const tickets = json.data ?? [];
      batch.forEach((msg, idx) => {
        const ticket = tickets[idx];
        outcomes.push({
          token: msg.to,
          ok: ticket?.status === 'ok',
          error: ticket?.details?.error,
        });
      });
    } catch (err) {
      // Network failure — mark the whole batch failed but keep going; the
      // cron will retry next run because dedupe markers are only written
      // after a successful send.
      console.error('[expo-push] batch send failed:', err);
      batch.forEach((msg) => outcomes.push({ token: msg.to, ok: false }));
    }
  }

  return outcomes;
}
