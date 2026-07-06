import { Easing } from 'react-native-reanimated';
import { FadeIn, FadeInDown } from 'react-native-reanimated';

// Premium motion language: quiet, quick, no bounce/overshoot. Everything uses
// an ease-out curve and short durations — content settles rather than springs.

const EASE = Easing.out(Easing.cubic);

// Subtle rise-and-fade for a single element.
export const enter = FadeInDown.duration(280).easing(EASE);

// Plain fade for things that shouldn't move (overlays, results).
export const fade = FadeIn.duration(220).easing(EASE);

// Staggered list entrance — small, capped delay so long lists don't feel slow
// or theatrical. Motion is a whisper, not a performance.
export function listEnter(index: number) {
  return FadeInDown.duration(260)
    .easing(EASE)
    .delay(Math.min(index, 8) * 28);
}

// Press feedback: a barely-there scale, critically damped (no rebound).
export const PRESS_SCALE = 0.985;
export const PRESS_SPRING = { damping: 32, stiffness: 420, mass: 0.6 } as const;
