import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/config';
import { Colors } from '@/constants/colors';
import { Button, Row } from '@/components/ui';
import { PressableScale } from '@/components/pressable-scale';

const WEB_LINKS: Array<{ label: string; path: string }> = [
  { label: 'Shipment board & workbook import', path: '/platform/shipments' },
  { label: 'Review queue', path: '/platform/shipments/review' },
  { label: 'Rate contracts', path: '/platform/contracts' },
  { label: 'All calculators', path: '/platform/calculators' },
  { label: 'Billing & plan', path: '/platform/billing' },
  { label: 'Team & settings', path: '/platform/settings' },
];

export default function AccountScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Account'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={{ marginTop: 10 }}>
          <Row label="Role" value={user?.role} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).springify().damping(18)} style={styles.card}>
        <Text style={styles.sectionTitle}>Full platform (web)</Text>
        {WEB_LINKS.map((link) => (
          <PressableScale
            key={link.path}
            style={styles.linkRow}
            onPress={() => Linking.openURL(`${API_URL}${link.path}`)}
          >
            <Text style={styles.linkText}>{link.label}</Text>
            <Text style={styles.linkArrow}>↗</Text>
          </PressableScale>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).springify().damping(18)}>
        <Button title="Sign out" variant="danger" onPress={logout} />
        <Text style={styles.version}>Shipping Savior mobile · v1.0.0</Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, gap: 14, paddingBottom: 48 },
  card: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { color: Colors.text, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  email: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 2 },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  linkText: { color: Colors.text, fontSize: 15 },
  linkArrow: { color: Colors.accent, fontSize: 15, fontWeight: '700' },
  version: {
    color: Colors.textFaint,
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 16,
  },
});
