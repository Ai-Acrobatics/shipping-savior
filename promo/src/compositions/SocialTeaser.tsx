import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Anchor } from "../components/Anchor";
import { Phone, BoardScreen, ScanScreen, AlertScreen } from "../components/Screens";
import { brand, FONT, NAME, TAGLINE } from "../brand";

const Beat: React.FC<{ title: string; sub: string; screen: React.ReactNode }> = ({ title, sub, screen }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const textIn = interpolate(frame, [8, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 150 }}>
      <div style={{ textAlign: "center", opacity: textIn, transform: `translateY(${(1 - textIn) * 20}px)`, marginBottom: 34, padding: "0 60px" }}>
        <div style={{ color: "#fff", fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
        <div style={{ color: brand.ocean400, fontSize: 30, marginTop: 12 }}>{sub}</div>
      </div>
      <div style={{ transform: `scale(${0.9 + inP * 0.1}) translateY(${(1 - inP) * 60}px)`, opacity: inP }}>
        <Phone w={430}>{screen}</Phone>
      </div>
    </AbsoluteFill>
  );
};

// 15s vertical (1080x1920) teaser.
export const SocialTeaser: React.FC = () => {
  const frame = useCurrentFrame();

  // intro logo
  const draw = interpolate(frame, [8, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const introOut = interpolate(frame, [60, 72], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Background />

      {/* 0.0–2.4s intro */}
      <Sequence from={0} durationInFrames={74}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: introOut }}>
          <div style={{ width: 150, height: 150, borderRadius: 42, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(127,180,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Anchor size={84} color={brand.white} draw={draw} />
          </div>
          <div style={{ color: "#fff", fontSize: 66, fontWeight: 800, marginTop: 30, letterSpacing: -1 }}>{NAME}</div>
          <div style={{ color: brand.ocean400, fontSize: 26, marginTop: 10 }}>{TAGLINE}</div>
        </AbsoluteFill>
      </Sequence>

      {/* 3 feature beats, ~3.4s each */}
      <Sequence from={74} durationInFrames={102}>
        <Beat title="Scan a BOL" sub="AI reads it instantly" screen={<ScanScreen />} />
      </Sequence>
      <Sequence from={176} durationInFrames={102}>
        <Beat title="Never miss a cutoff" sub="Alerts before the clock runs out" screen={<AlertScreen />} />
      </Sequence>
      <Sequence from={278} durationInFrames={102}>
        <Beat title="Your whole board" sub="Every container, in your pocket" screen={<BoardScreen />} />
      </Sequence>

      {/* CTA 12.6–15s */}
      <Sequence from={380} durationInFrames={70}>
        <Cta />
      </Sequence>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: p }}>
      <div style={{ width: 120, height: 120, borderRadius: 34, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(127,180,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.8 + p * 0.2})` }}>
        <Anchor size={68} color={brand.white} draw={1} />
      </div>
      <div style={{ color: "#fff", fontSize: 60, fontWeight: 800, marginTop: 28 }}>{NAME}</div>
      <div
        style={{
          marginTop: 22,
          padding: "16px 40px",
          borderRadius: 999,
          background: brand.accentGradient,
          color: "#fff",
          fontSize: 30,
          fontWeight: 700,
        }}
      >
        Now on iOS &amp; Android
      </div>
    </AbsoluteFill>
  );
};
