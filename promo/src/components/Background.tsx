import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { brand } from "../brand";

// Deep-ocean backdrop with slow-drifting route dots + arcs. Deterministic
// (frame-based) so it renders identically every time.
export const Background: React.FC<{ loopFrames?: number }> = ({ loopFrames }) => {
  const frame = useCurrentFrame();
  const t = loopFrames ? (frame % loopFrames) / loopFrames : frame / 300;

  const dots = Array.from({ length: 28 }, (_, i) => {
    const seed = i * 137.5;
    const x = (seed % 100) + Math.sin((t * Math.PI * 2) + i) * 3;
    const y = ((seed * 1.7) % 100) + Math.cos((t * Math.PI * 2) + i * 0.6) * 3;
    const r = 1 + (i % 3);
    const op = 0.06 + ((i % 5) / 5) * 0.14;
    return { x, y, r, op };
  });

  return (
    <AbsoluteFill style={{ background: brand.bgGradient }}>
      {/* soft glow orbs */}
      <div
        style={{
          position: "absolute",
          width: "60%",
          height: "60%",
          left: `${20 + Math.sin(t * Math.PI * 2) * 6}%`,
          top: `${10 + Math.cos(t * Math.PI * 2) * 5}%`,
          background: "radial-gradient(circle, rgba(37,99,235,0.28), transparent 60%)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "50%",
          height: "50%",
          right: `${10 + Math.cos(t * Math.PI * 2) * 6}%`,
          bottom: `${8 + Math.sin(t * Math.PI * 2) * 5}%`,
          background: "radial-gradient(circle, rgba(56,189,248,0.20), transparent 60%)",
          filter: "blur(50px)",
        }}
      />
      {/* route dots */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r * 0.18} fill="#7FB4FF" opacity={d.op} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// Frame-driven fade/slide helper.
export const useReveal = (start: number, dur = 18) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};
