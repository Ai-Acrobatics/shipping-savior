import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

// Animated confidence meter for OCR results — fills to the score with a color
// ramp (red < 0.5 <= amber < 0.8 <= green).
export function ConfidenceBar({ value, delay = 150 }: { value: number; delay?: number }) {
  const width = useSharedValue(0);
  const clamped = Math.max(0, Math.min(1, value));

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(clamped, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, [clamped, delay, width]);

  const fill = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  const color =
    clamped >= 0.8 ? Colors.success : clamped >= 0.5 ? Colors.warning : Colors.danger;

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
});
