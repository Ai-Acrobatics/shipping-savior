import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Anchor } from "../components/Anchor";
import { Phone, LoginScreen, BoardScreen, ScanScreen, AlertScreen } from "../components/Screens";
import { brand, FONT, NAME, TAGLINE } from "../brand";

// A calmer 30s (1080x1080) walkthrough — phone on the right, caption on the left.
const Panel: React.FC<{ kicker: string; title: string; body: string; screen: React.ReactNode }> = ({
  kicker,
  title,
  body,
  screen,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const textIn = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: 80 }}>
      <div style={{ flex: 1, paddingRight: 40, opacity: textIn, transform: `translateX(${(1 - textIn) * -30}px)` }}>
        <div style={{ color: brand.ocean400, fontSize: 22, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{kicker}</div>
        <div style={{ color: "#fff", fontSize: 56, fontWeight: 800, marginTop: 14, lineHeight: 1.1 }}>{title}</div>
        <div style={{ color: brand.slate300, fontSize: 26, marginTop: 18, lineHeight: 1.4 }}>{body}</div>
      </div>
      <div style={{ transform: `translateY(${(1 - inP) * 50}px)`, opacity: inP }}>
        <Phone w={360}>{screen}</Phone>
      </div>
    </AbsoluteFill>
  );
};

export const SquareDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [8, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const introOut = interpolate(frame, [70, 84], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Background />

      <Sequence from={0} durationInFrames={86}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: introOut }}>
          <div style={{ width: 140, height: 140, borderRadius: 40, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(127,180,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Anchor size={78} color={brand.white} draw={draw} />
          </div>
          <div style={{ color: "#fff", fontSize: 62, fontWeight: 800, marginTop: 28 }}>{NAME}</div>
          <div style={{ color: brand.ocean400, fontSize: 26, marginTop: 10 }}>{TAGLINE}</div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={86} durationInFrames={190}>
        <Panel kicker="Track" title="Every shipment, live" body="Your weekly board in your pocket — status, route, ETA and days-to-arrival at a glance." screen={<BoardScreen />} />
      </Sequence>
      <Sequence from={276} durationInFrames={190}>
        <Panel kicker="Scan" title="Snap a Bill of Lading" body="The AI extracts containers, vessel, ports, dates and parties — no more re-keying at the terminal." screen={<ScanScreen />} />
      </Sequence>
      <Sequence from={466} durationInFrames={190}>
        <Panel kicker="Alert" title="Never miss a cutoff" body="Reefer and document cutoff alerts land on your phone before the clock runs out." screen={<AlertScreen />} />
      </Sequence>
      <Sequence from={656} durationInFrames={150}>
        <Panel kicker="Sign in" title="Freight intelligence" body="Duty rates, HTS codes, landed-cost, an AI logistics copilot — all in one place." screen={<LoginScreen />} />
      </Sequence>

      <Sequence from={806} durationInFrames={94}>
        <Cta />
      </Sequence>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: p }}>
      <div style={{ width: 130, height: 130, borderRadius: 36, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(127,180,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.85 + p * 0.15})` }}>
        <Anchor size={72} color={brand.white} draw={1} />
      </div>
      <div style={{ color: "#fff", fontSize: 58, fontWeight: 800, marginTop: 26 }}>{NAME}</div>
      <div style={{ marginTop: 20, padding: "16px 42px", borderRadius: 999, background: brand.accentGradient, color: "#fff", fontSize: 28, fontWeight: 700 }}>
        Now on iOS &amp; Android
      </div>
    </AbsoluteFill>
  );
};
