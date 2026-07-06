import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme';
import { enter, fade } from '@/lib/motion';
import { Button, Field } from '@/components/ui';
import { API_URL } from '@/lib/config';

export default function LoginScreen() {
  const { login } = useAuth();
  const c = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError(e instanceof Error ? e.message : 'Login failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28, backgroundColor: c.bg }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={enter}>
          <View style={[styles.logoBadge, { backgroundColor: c.accentSoft }]}>
            <Ionicons name="boat" size={30} color={c.accent} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>Shipping Savior</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            Freight intelligence in your pocket
          </Text>
        </Animated.View>

        <Animated.View entering={fade} style={{ gap: 2 }}>
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@company.com" keyboardType="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          {error ? <Text style={{ color: c.danger, marginBottom: 12, fontSize: 14 }}>{error}</Text> : null}
          <Button title="Sign in" onPress={submit} loading={busy} />
          <Text style={[styles.hint, { color: c.textFaint }]}>
            No account yet? Register on the web at {API_URL.replace(/^https?:\/\//, '')}
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', letterSpacing: 0.2 },
  subtitle: { fontSize: 15, textAlign: 'center', marginTop: 6, marginBottom: 36 },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 18, lineHeight: 19 },
});
