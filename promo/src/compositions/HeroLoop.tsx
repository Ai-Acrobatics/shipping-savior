import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { brand, FONT } from "../brand";

// Seamless 8s loop for the marketing-site hero background — deep-ocean field
// with container ships gliding along dashed routes. No text (it sits behind
// the hero copy). Loops perfectly (state at frame 0 === frame LOOP).
const LOOP = 240;

const Ship: React.FC<{ y: number; phase: number; scale: number; op: number }> = ({ y, phase, scale, op }) => {
  const frame = useCurrentFrame();
  const t = ((frame + phase) % LOOP) / LOOP;
  const x = interpolate(t, [0, 1], [-10, 110]);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={op}>
      <rect x={-6} y={-2.2} width={12} height={3.4} rx={0.8} fill="#7FB4FF" />
      <rect x={-3.5} y={-4} width={5} height={2} rx={0.5} fill="#B9D5FF" />
      <circle cx={9} cy={0} r={0.7} fill={brand.sky} opacity={0.9} />
    </g>
  );
};

export const HeroLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = (frame % LOOP) / LOOP;
  const dash = interpolate(t, [0, 1], [0, -24]);

  const ships = [
    { y: 26, phase: 0, scale: 1.1, op: 0.9 },
    { y: 52, phase: 90, scale: 0.85, op: 0.6 },
    { y: 74, phase: 160, scale: 1.0, op: 0.8 },
    { y: 40, phase: 210, scale: 0.7, op: 0.45 },
  ];

  return (
    <AbsoluteFill style={{ background: brand.bgGradient, fontFamily: FONT }}>
      {/* glow */}
      <div style={{ position: "absolute", width: "70%", height: "80%", left: `${10 + Math.sin(t * Math.PI * 2) * 4}%`, top: "5%", background: "radial-gradient(circle, rgba(37,99,235,0.22), transparent 60%)", filter: "blur(60px)" }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* dashed shipping routes */}
        {[24, 50, 72, 38].map((y, i) => (
          <line key={i} x1={-5} y1={y} x2={105} y2={y + (i % 2 ? 3 : -3)} stroke="#3B6FD4" strokeWidth={0.25} strokeDasharray="1.5 2.5" strokeDashoffset={dash} opacity={0.35} />
        ))}
        {ships.map((s, i) => (
          <Ship key={i} {...s} />
        ))}
        {/* drifting cargo dots */}
        {Array.from({ length: 22 }, (_, i) => {
          const yy = (i * 4.5) % 100;
          const xx = ((i * 13 + frame * 0.15) % 110) - 5;
          return <circle key={"d" + i} cx={xx} cy={yy} r={0.22} fill="#8FB8FF" opacity={0.15 + (i % 4) * 0.06} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
