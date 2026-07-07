import React from "react";

// Animated anchor mark. `draw` (0..1) strokes the path on; `scale` sizes it.
export const Anchor: React.FC<{ size: number; color: string; draw?: number }> = ({
  size,
  color,
  draw = 1,
}) => {
  // Total path length is ~ the sum of segments; using a generous dash length
  // and animating the offset yields a clean "draw-on" effect.
  const LEN = 140;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <g
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: LEN,
          strokeDashoffset: LEN * (1 - draw),
        }}
      >
        <circle cx="12" cy="5" r="2.4" />
        <line x1="12" y1="22" x2="12" y2="8" />
        <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
      </g>
    </svg>
  );
};
