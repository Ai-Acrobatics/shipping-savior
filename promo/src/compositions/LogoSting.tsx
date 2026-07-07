import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Anchor } from "../components/Anchor";
import { brand, FONT, NAME, TAGLINE } from "../brand";

// 3.5s branded logo sting — reusable intro / bumper.
export const LogoSting: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const draw = interpolate(frame, [6, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgePop = spring({ frame: frame - 4, fps, config: { damping: 16, stiffness: 120 } });
  const nameIn = interpolate(frame, [38, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagIn = interpolate(frame, [52, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = interpolate(frame, [92, 105], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: out }}>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: 44,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(127,180,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${0.6 + badgePop * 0.4})`,
            boxShadow: "0 20px 60px rgba(37,99,235,0.35)",
          }}
        >
          <Anchor size={90} color={brand.white} draw={draw} />
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 64,
            fontWeight: 800,
            marginTop: 34,
            letterSpacing: -1,
            opacity: nameIn,
            transform: `translateY(${(1 - nameIn) * 16}px)`,
          }}
        >
          {NAME}
        </div>
        <div style={{ color: brand.ocean400, fontSize: 24, marginTop: 10, opacity: tagIn, letterSpacing: 0.5 }}>
          {TAGLINE}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
