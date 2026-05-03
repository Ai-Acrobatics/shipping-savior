import { ImageResponse } from "next/og";

// Route-segment config for the OG image
export const runtime = "edge";
export const alt = "Shipping Savior — International logistics intelligence";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Image generation
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0c4a6e 0%, #0369a1 35%, #0891b2 70%, #06b6d4 100%)",
          position: "relative",
        }}
      >
        {/* Decorative blob top-right */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "440px",
            height: "440px",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.12)",
            display: "flex",
          }}
        />
        {/* Decorative blob bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "-160px",
            left: "-80px",
            width: "380px",
            height: "380px",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />

        {/* Top: Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            zIndex: 1,
          }}
        >
          {/* Anchor mark */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              fontWeight: 700,
              color: "#0369a1",
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            Shipping Savior
          </div>
        </div>

        {/* Middle: Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: "84px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              maxWidth: "1000px",
              display: "flex",
            }}
          >
            International logistics intelligence
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.3,
              maxWidth: "900px",
              display: "flex",
            }}
          >
            Real-time schedules, FTZ modeling, and contract intelligence across
            8+ carriers and 3,700+ ports
          </div>
        </div>

        {/* Bottom: URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.92)",
              fontWeight: 500,
              display: "flex",
            }}
          >
            shipping-savior.vercel.app
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 24px",
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              fontSize: "22px",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "9999px",
                background: "#86efac",
                display: "flex",
              }}
            />
            Live trade data
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
