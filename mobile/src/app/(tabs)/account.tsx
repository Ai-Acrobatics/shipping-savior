import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/config';
import { useTheme, useThemeMode, type ThemeMode } from '@/lib/theme';
import { enter, fade } from '@/lib/motion';
import { Button, cardStyle } from '@/components/ui';
import { PressableScale } from '@/components/pressable-scale';
import { registerForPushNotifications, unregisterPushToken } from '@/lib/push';

// These open in an in-app browser (Safari View Controller) — the user stays
// inside Shipping Savior, themed to match, with a Done button to return. They
// never get bounced out to the external browser.
const FEATURES: Array<{ label: string; path: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: 'Shipment board & workbook import', path: '/platform/shipments', icon: 'cube-outline' },
  { label: 'Weekly load board', path: '/platform/load-board', icon: 'grid-outline' },
  { label: 'Review queue', path: '/platform/shipments/review', icon: 'checkmark-done-outline' },
  { label: 'Rate contracts', path: '/platform/contracts', icon: 'document-text-outline' },
  { label: 'All calculators', path: '/platform/calculators', icon: 'calculator-outline' },
  { label: 'Billing & plan', path: '/platform/billing', icon: 'card-outline' },
  { label: 'Team & settings', path: '/platform/settings', icon: 'people-outline' },
];

const MODES: Array<{ key: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const c = useTheme();
  const { mode, setMode } = useThemeMode();
  const [notify, setNotify] = useState(true);

  const openInApp = (path: string) => {
    Haptics.selectionAsync().catch(() => {});
    WebBrowser.openBrowserAsync(`${API_URL}${path}`, {
      controlsColor: c.accent,
      toolbarColor: c.bgElevated,
      dismissButtonStyle: 'done',
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    }).catch(() => {});
  };

  const toggleNotify = async (on: boolean) => {
    setNotify(on);
    try {
      if (on) await registerForPushNotifications();
      else await unregisterPushToken();
    } catch {
      /* ignore */
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
      {/* Profile */}
      <Animated.View entering={enter} style={{ ...cardStyle(c), padding: 18, alignItems: 'center' }}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={{ width: 66, height: 66, borderRadius: 33, marginBottom: 10 }} />
        ) : (
          <View style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Text style={{ color: c.accent, fontSize: 26, fontWeight: '800' }}>
              {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={{ color: c.text, fontSize: 19, fontWeight: '800' }}>{user?.name ?? 'Account'}</Text>
        <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 2 }}>{user?.email}</Text>
        {user?.role ? (
          <View style={{ marginTop: 10, backgroundColor: c.accentSoft, borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: c.accent, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{user.role}</Text>
          </View>
        ) : null}
      </Animated.View>

      {/* Preferences */}
      <Animated.View entering={fade} style={{ ...cardStyle(c), padding: 16 }}>
        <Text style={sectionLabel(c.textMuted)}>Appearance</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 4 }}>
          {MODES.map((m) => {
            const active = mode === m.key;
            return (
              <PressableScale
                key={m.key}
                style={{ flex: 1, alignItems: 'center', gap: 5, paddingVertical: 12, borderRadius: 12, borderWidth: 1, backgroundColor: active ? c.accentSoft : c.bg, borderColor: active ? c.accent : c.border }}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setMode(m.key);
                }}
              >
                <Ionicons name={m.icon} size={19} color={active ? c.accent : c.textMuted} />
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: active ? c.accent : c.textMuted }}>{m.label}</Text>
              </PressableScale>
            );
          })}
        </View>

        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginVertical: 12 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="notifications-outline" size={19} color={c.textMuted} />
            <View>
              <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>Cutoff & delay alerts</Text>
              <Text style={{ color: c.textFaint, fontSize: 12 }}>Push when a cutoff is under 24h</Text>
            </View>
          </View>
          <Switch value={notify} onValueChange={toggleNotify} trackColor={{ true: c.accent }} />
        </View>
      </Animated.View>

      {/* Platform features — open in-app */}
      <Animated.View entering={fade} style={{ ...cardStyle(c), paddingHorizontal: 16 }}>
        <Text style={[sectionLabel(c.textMuted), { marginTop: 14 }]}>Platform</Text>
        {FEATURES.map((f, i) => (
          <PressableScale
            key={f.path}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: i === FEATURES.length - 1 ? 0 : StyleSheet.hairlineWidth, borderBottomColor: c.border }}
            onPress={() => openInApp(f.path)}
          >
            <Ionicons name={f.icon} size={19} color={c.accent} />
            <Text style={{ color: c.text, fontSize: 15, flex: 1 }}>{f.label}</Text>
            <Ionicons name="chevron-forward" size={17} color={c.textFaint} />
          </PressableScale>
        ))}
      </Animated.View>

      <Animated.View entering={fade}>
        <Button title="Sign out" variant="danger" onPress={logout} />
        <Text style={{ color: c.textFaint, fontSize: 12.5, textAlign: 'center', marginTop: 16 }}>Shipping Savior · v1.0.0</Text>
      </Animated.View>
    </ScrollView>
  );
}

const sectionLabel = (color: string) =>
  ({ color, fontSize: 12.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }) as const;
