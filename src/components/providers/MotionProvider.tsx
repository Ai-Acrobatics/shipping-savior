"use client";

import { MotionConfig } from "framer-motion";

/**
 * Honors the user's `prefers-reduced-motion` OS setting for every
 * framer-motion animation in the app (WCAG 2.3.3). With `reducedMotion="user"`
 * framer skips transform/opacity entrance animations for users who asked for
 * less motion — and the e2e a11y suite emulates that preference so axe scans
 * a stable, fully-opaque frame instead of a mid-fade one.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
