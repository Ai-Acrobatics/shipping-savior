import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand, FONT, NAME, TAGLINE } from "../brand";
import { Anchor } from "./Anchor";

// Screens are self-driven from the (sequence-relative) current frame, so they
// animate correctly wherever they're mounted.
const useProgress = (start: number, dur: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// ── Phone frame ───────────────────────────────────────────
export const Phone: React.FC<{ children: React.ReactNode; w?: number }> = ({
  children,
  w = 360,
}) => {
  const h = w * 2.16;
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: w * 0.11,
        background: "#0B0E14",
        border: "3px solid #222A38",
        boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* notch */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: w * 0.3,
          height: 20,
          borderRadius: 12,
          background: "#000",
          zIndex: 5,
        }}
      />
      {children}
    </div>
  );
};

const StatusPill: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      borderRadius: 6,
      background: `${color}22`,
      padding: "3px 9px",
    }}
  >
    <div style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
    <span style={{ color, fontSize: 11, fontWeight: 700, letterSpacing: 0.4 }}>{label}</span>
  </div>
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      background: "#141922",
      border: "1px solid #232A36",
      borderRadius: 16,
      padding: 15,
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Login screen ──────────────────────────────────────────
export const LoginScreen: React.FC = () => {
  const progress = useProgress(4, 30);
  return (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "#0B0E14",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT,
      padding: 28,
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 18,
        background: "rgba(91,141,239,0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
      }}
    >
      <Anchor size={34} color={brand.ocean400} draw={progress} />
    </div>
    <div style={{ color: "#fff", fontSize: 26, fontWeight: 800 }}>{NAME}</div>
    <div style={{ color: brand.slate400, fontSize: 13, marginTop: 6 }}>{TAGLINE}</div>
  </div>
  );
};

// ── Shipments board ───────────────────────────────────────
const rows = [
  { c: "MSCU 7841203", a: "Port Hueneme", b: "Yokohama", eta: "ETA Jul 23 · 16d", st: "In Transit", col: brand.ocean400 },
  { c: "TCLU 5563318", a: "Port Hueneme", b: "Busan", eta: "ETA Jul 25 · 18d", st: "Planned", col: "#9B8CFF" },
  { c: "MAEU 3390771", a: "Long Beach", b: "Shanghai", eta: "ETA Jul 22 · 15d", st: "Delayed", col: brand.danger },
];
export const BoardScreen: React.FC = () => {
  const reveal = useProgress(6, 55);
  return (
  <div style={{ position: "absolute", inset: 0, background: "#0B0E14", fontFamily: FONT, padding: 16, paddingTop: 44 }}>
    <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Shipments</div>
    <div style={{ color: brand.slate400, fontSize: 13, marginBottom: 12 }}>3 shipments · 3 in transit</div>
    {rows.map((r, i) => {
      const p = interpolate(reveal, [i * 0.18, i * 0.18 + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return (
        <Card key={r.c} style={{ marginBottom: 10, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{r.c}</span>
            <StatusPill label={r.st} color={r.col} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <span style={{ color: "#CBD5E1", fontSize: 13, flex: 1 }}>{r.a}</span>
            <span style={{ color: brand.ocean400, fontWeight: 700 }}>→</span>
            <span style={{ color: "#CBD5E1", fontSize: 13, flex: 1, textAlign: "right" }}>{r.b}</span>
          </div>
          <div style={{ color: brand.slate500, fontSize: 12, marginTop: 10, textAlign: "right" }}>{r.eta}</div>
        </Card>
      );
    })}
  </div>
  );
};

// ── Scan / OCR screen ─────────────────────────────────────
const fields = [
  ["Container", "MSCU 7841203", 0.97],
  ["Vessel", "MSC ALTAIR", 0.95],
  ["POL", "Port Hueneme", 0.96],
  ["POD", "Yokohama", 0.94],
  ["Carrier", "MSC", 0.99],
  ["Weight", "22,000 kg", 0.9],
] as const;
export const ScanScreen: React.FC = () => {
  const reveal = useProgress(6, 45);
  return (
  <div style={{ position: "absolute", inset: 0, background: "#0B0E14", fontFamily: FONT, padding: 16, paddingTop: 44 }}>
    <div style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>Scan a Bill of Lading</div>
    <Card style={{ marginTop: 14 }}>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 10 }}>Extracted fields</div>
      {fields.map(([label, val, conf], i) => {
        const p = interpolate(reveal, [i * 0.12, i * 0.12 + 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const barCol = conf >= 0.8 ? brand.success : brand.amber;
        return (
          <div key={label} style={{ padding: "7px 0", opacity: p }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: brand.slate400, fontSize: 13 }}>{label}</span>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{val}</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: "#232A36", marginTop: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(conf as number) * 100 * p}%`, background: barCol }} />
            </div>
          </div>
        );
      })}
    </Card>
  </div>
  );
};

// ── Cutoff-alert push notification ────────────────────────
export const AlertScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 120 } });
  return (
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#0B0E14,#101A2E)", fontFamily: FONT }}>
    <div style={{ position: "absolute", top: 60, left: 14, right: 14, transform: `translateY(${(1 - pop) * -120}px)`, opacity: pop }}>
      <div
        style={{
          background: "rgba(20,25,34,0.92)",
          backdropFilter: "blur(20px)",
          borderRadius: 20,
          padding: 14,
          border: "1px solid #2A3446",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 10, background: brand.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⏰</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Reefer cutoff in ~14h — MSCU 7841203</div>
          <div style={{ color: brand.slate400, fontSize: 12.5, marginTop: 3 }}>
            Port Hueneme · confirm gate-in and docs now.
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
