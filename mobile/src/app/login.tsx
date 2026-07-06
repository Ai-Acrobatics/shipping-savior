import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/lib/auth-context';
import { Button, Field } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { API_URL } from '@/lib/config';

export default function LoginScreen() {
  const { login } = useAuth();
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
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(500).springify()}>
          <Text style={styles.logo}>⚓</Text>
          <Text style={styles.title}>Shipping Savior</Text>
          <Text style={styles.subtitle}>
            Freight intelligence in your pocket
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).duration(500).springify()} style={styles.form}>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            keyboardType="email-address"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Sign in" onPress={submit} loading={busy} />
          <Text style={styles.hint}>
            No account yet? Register on the web at{' '}
            {API_URL.replace(/^https?:\/\//, '')}
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
    backgroundColor: Colors.bg,
  },
  logo: { fontSize: 44, textAlign: 'center', marginBottom: 12 },
  title: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 36,
  },
  form: { gap: 4 },
  error: { color: Colors.danger, marginBottom: 12, fontSize: 14 },
  hint: {
    color: Colors.textFaint,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 18,
  },
});
