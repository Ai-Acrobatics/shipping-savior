import React from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { PRESS_SCALE, PRESS_SPRING } from '@/lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  style?: ViewStyle | ViewStyle[];
  haptic?: boolean;
  scaleTo?: number;
}

// Refined press feedback: a barely-perceptible, critically-damped scale (no
// rebound) plus an optional whisper-light haptic. Premium, not springy.
export function PressableScale({
  style,
  haptic = true,
  scaleTo = PRESS_SCALE,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, PRESS_SPRING);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, PRESS_SPRING);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) {
          Haptics.selectionAsync().catch(() => {});
        }
        onPress?.(e);
      }}
      {...rest}
    />
  );
}
