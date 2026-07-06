import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

// ── Palette ───────────────────────────────────────────────
// Restrained, premium palette. One sophisticated accent, layered neutral
// surfaces, semantic status colors tuned per scheme. No neon, no flat navy.

export interface Palette {
  scheme: 'light' | 'dark';
  bg: string;
  bgElevated: string;
  card: string;
  cardPressed: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentSoft: string; // low-alpha accent for fills
  accentText: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  // shadow used for elevated cards (light mode only; dark relies on borders)
  shadowOpacity: number;
}

const light: Palette = {
  scheme: 'light',
  bg: '#F6F8FB',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardPressed: '#EEF2F7',
  border: '#E7ECF3',
  borderStrong: '#D5DCE6',
  text: '#111827',
  textMuted: '#5A6675',
  textFaint: '#98A2B3',
  accent: '#1D4ED8',
  accentSoft: 'rgba(29,78,216,0.10)',
  accentText: '#FFFFFF',
  success: '#12805C',
  warning: '#B45309',
  danger: '#B42318',
  info: '#5B4CC4',
  shadowOpacity: 0.06,
};

const dark: Palette = {
  scheme: 'dark',
  bg: '#0B0E14',
  bgElevated: '#141922',
  card: '#141922',
  cardPressed: '#1B212C',
  border: '#232A36',
  borderStrong: '#2E3745',
  text: '#F4F6FA',
  textMuted: '#9BA6B7',
  textFaint: '#63708',
  accent: '#5B8DEF',
  accentSoft: 'rgba(91,141,239,0.16)',
  accentText: '#0B0E14',
  success: '#3DD68C',
  warning: '#F6B44C',
  danger: '#F87A6D',
  info: '#9B8CFF',
  shadowOpacity: 0,
};

// fix a truncated token safely
dark.textFaint = '#637084';

const ThemeContext = createContext<Palette>(dark);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const palette = useMemo(() => (scheme === 'light' ? light : dark), [scheme]);
  return <ThemeContext.Provider value={palette}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Palette {
  return useContext(ThemeContext);
}

// Status → color, resolved against the active palette.
export function statusColor(status: string, c: Palette): string {
  switch (status) {
    case 'delivered':
      return c.success;
    case 'delayed':
      return c.danger;
    case 'arrived':
      return c.warning;
    case 'planned':
      return c.info;
    case 'cancelled':
      return c.textFaint;
    default:
      return c.accent; // in_transit and anything else
  }
}

export function statusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
