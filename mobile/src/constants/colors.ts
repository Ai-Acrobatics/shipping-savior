// Brand palette — mirrors the web app's navy/ocean theme (#0f172a base).
export const Colors = {
  bg: '#0f172a',
  bgElevated: '#1e293b',
  card: '#1e293b',
  cardPressed: '#26334a',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textFaint: '#64748b',
  accent: '#0ea5e9',
  accentDark: '#0284c7',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#818cf8',
};

export const StatusColors: Record<string, string> = {
  planned: Colors.info,
  in_transit: Colors.accent,
  arrived: Colors.warning,
  delivered: Colors.success,
  delayed: Colors.danger,
  cancelled: Colors.textFaint,
};

export function statusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
