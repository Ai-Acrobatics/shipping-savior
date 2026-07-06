import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/config';
import { useTheme } from '@/lib/theme';
import { enter, fade } from '@/lib/motion';
import { Button, Row, cardStyle } from '@/components/ui';
import { PressableScale } from '@/components/pressable-scale';

const WEB_LINKS: Array<{ label: string; path: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { label: 'Shipment board & workbook import', path: '/platform/shipments', icon: 'cube-outline' },
  { label: 'Review queue', path: '/platform/shipments/review', icon: 'checkmark-done-outline' },
  { label: 'Rate contracts', path: '/platform/contracts', icon: 'document-text-outline' },
  { label: 'All calculators', path: '/platform/calculators', icon: 'calculator-outline' },
  { label: 'Billing & plan', path: '/platform/billing', icon: 'card-outline' },
  { label: 'Team & settings', path: '/platform/settings', icon: 'people-outline' },
];

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const c = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
      <Animated.View entering={enter} style={{ ...cardStyle(c), padding: 18, alignItems: 'center' }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <Text style={{ color: c.accentText, fontSize: 25, fontWeight: '800' }}>
            {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: c.text, fontSize: 19, fontWeight: '800' }}>{user?.name ?? 'Account'}</Text>
        <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 2 }}>{user?.email}</Text>
        <View style={{ width: '100%', marginTop: 10 }}>
          <Row label="Role" value={user?.role} />
        </View>
      </Animated.View>

      <Animated.View entering={fade} style={{ ...cardStyle(c), padding: 6, paddingHorizontal: 16 }}>
        <Text style={{ color: c.textMuted, fontSize: 12.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 12, marginBottom: 4 }}>
          Full platform (web)
        </Text>
        {WEB_LINKS.map((link) => (
          <PressableScale
            key={link.path}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }}
            onPress={() => Linking.openURL(`${API_URL}${link.path}`)}
          >
            <Ionicons name={link.icon} size={19} color={c.accent} />
            <Text style={{ color: c.text, fontSize: 15, flex: 1 }}>{link.label}</Text>
            <Ionicons name="open-outline" size={16} color={c.textFaint} />
          </PressableScale>
        ))}
      </Animated.View>

      <Animated.View entering={fade}>
        <Button title="Sign out" variant="danger" onPress={logout} />
        <Text style={{ color: c.textFaint, fontSize: 12.5, textAlign: 'center', marginTop: 16 }}>
          Shipping Savior · v1.0.0
        </Text>
      </Animated.View>
    </ScrollView>
  );
}
