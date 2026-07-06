import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { useTheme, statusColor, statusLabel, type Palette } from '@/lib/theme';
import { PressableScale } from './pressable-scale';

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  suffix?: string;
}) {
  const c = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: c.textMuted, fontSize: 12.5, fontWeight: '600', marginBottom: 7, letterSpacing: 0.2 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: c.bgElevated,
            borderColor: c.border,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 13,
            color: c.text,
            fontSize: 16,
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.textFaint}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
        />
        {suffix ? <Text style={{ color: c.textMuted, marginLeft: 8, fontSize: 15 }}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  icon,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}) {
  const c = useTheme();
  const bg =
    variant === 'primary' ? c.accent : variant === 'danger' ? 'transparent' : c.bgElevated;
  const fg =
    variant === 'primary' ? c.accentText : variant === 'danger' ? c.danger : c.text;
  return (
    <PressableScale
      style={{
        flexDirection: 'row',
        gap: 8,
        borderRadius: 13,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
        opacity: disabled || loading ? 0.45 : 1,
        borderWidth: variant === 'primary' ? 0 : 1,
        borderColor: variant === 'danger' ? c.border : c.border,
      }}
      onPress={() => {
        if (!disabled && !loading) onPress();
      }}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon}
          <Text style={{ fontSize: 15.5, fontWeight: '700', color: fg, letterSpacing: 0.2 }}>{title}</Text>
        </>
      )}
    </PressableScale>
  );
}

export function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  const c = useTheme();
  const color = statusColor(status, c);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: 6,
        backgroundColor: `${color}1A`,
        paddingHorizontal: small ? 7 : 9,
        paddingVertical: small ? 3 : 4,
        gap: 5,
      }}
    >
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
      <Text style={{ color, fontSize: small ? 10.5 : 11.5, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' }}>
        {statusLabel(status)}
      </Text>
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  const c = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 }}>
      <Text style={{ color: c.text, fontSize: 17, fontWeight: '700', marginBottom: 6 }}>{title}</Text>
      {subtitle ? (
        <Text style={{ color: c.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function Row({ label, value }: { label: string; value: string | null | undefined }) {
  const c = useTheme();
  if (!value) return null;
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 11,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: c.border,
        gap: 16,
      }}
    >
      <Text style={{ color: c.textMuted, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: c.text, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

// Elevated card surface — subtle shadow in light, hairline border in dark.
export function cardStyle(c: Palette) {
  return {
    backgroundColor: c.card,
    borderColor: c.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    shadowColor: '#0B1220',
    shadowOpacity: c.shadowOpacity,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  } as const;
}
