import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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
  accentSoft: string;
  accentText: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
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
  textFaint: '#637084',
  accent: '#5B8DEF',
  accentSoft: 'rgba(91,141,239,0.16)',
  accentText: '#0B0E14',
  success: '#3DD68C',
  warning: '#F6B44C',
  danger: '#F87A6D',
  info: '#9B8CFF',
  shadowOpacity: 0,
};

export type ThemeMode = 'system' | 'light' | 'dark';
const MODE_KEY = 'ss.theme.mode';

interface ThemeCtx extends Palette {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeCtx>({ ...dark, mode: 'system', setMode: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    SecureStore.getItemAsync(MODE_KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setModeState(v);
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    SecureStore.setItemAsync(MODE_KEY, m).catch(() => {});
  }, []);

  const value = useMemo<ThemeCtx>(() => {
    const resolved = mode === 'system' ? (system === 'light' ? 'light' : 'dark') : mode;
    const palette = resolved === 'light' ? light : dark;
    return { ...palette, mode, setMode };
  }, [mode, system, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Palette {
  return useContext(ThemeContext);
}

export function useThemeMode(): { mode: ThemeMode; setMode: (m: ThemeMode) => void } {
  const { mode, setMode } = useContext(ThemeContext);
  return { mode, setMode };
}

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
      return c.accent;
  }
}

export function statusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
