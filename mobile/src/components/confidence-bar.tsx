import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';

// Confidence meter for OCR results — a quiet fill with a color ramp
// (danger < 0.5 <= warning < 0.8 <= success).
export function ConfidenceBar({ value, delay = 120 }: { value: number; delay?: number }) {
  const c = useTheme();
  const width = useSharedValue(0);
  const clamped = Math.max(0, Math.min(1, value));

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(clamped, { duration: 480, easing: Easing.out(Easing.cubic) })
    );
  }, [clamped, delay, width]);

  const fill = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));
  const color = clamped >= 0.8 ? c.success : clamped >= 0.5 ? c.warning : c.danger;

  return (
    <View style={{ height: 3, borderRadius: 2, backgroundColor: c.border, overflow: 'hidden' }}>
      <Animated.View style={[{ height: '100%', borderRadius: 2, backgroundColor: color }, fill]} />
    </View>
  );
}
