"use client";

import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";

interface FlightArc {
  id: string;
  from: [number, number];
  to: [number, number];
}

interface FlightMarker {
  id: string;
  location: [number, number];
}

interface GlobeFlightsProps {
  arcs?: FlightArc[];
  markers?: FlightMarker[];
  className?: string;
  speed?: number;
}

// Shipping Savior default: real global trade lanes Blake described in the
// April 2026 JV calls. Arcs are origin → destination port pairs.
const defaultArcs: FlightArc[] = [
  // Primary investor-demo lane: Qingdao → Long Beach
  { id: "lane-qingdao-longbeach", from: [36.07, 120.38], to: [33.75, -118.2] },
  // Rotterdam → Balboa (Chiquita's Netherlands ex-works program)
  { id: "lane-rotterdam-balboa", from: [51.95, 4.14], to: [8.96, -79.57] },
  // Shanghai → LA
  { id: "lane-shanghai-la", from: [31.37, 121.5], to: [33.73, -118.26] },
  // Singapore → Oakland
  { id: "lane-singapore-oakland", from: [1.26, 103.8], to: [37.8, -122.32] },
  // Hamburg → Cartagena (European exports to Central America)
  { id: "lane-hamburg-cartagena", from: [53.54, 9.98], to: [10.4, -75.52] },
  // Yokohama → Seattle
  { id: "lane-yokohama-seattle", from: [35.45, 139.65], to: [47.6, -122.33] },
  // Jones Act: Seattle → Honolulu
  { id: "lane-jones-seattle-hnl", from: [47.6, -122.33], to: [21.31, -157.87] },
  // Jones Act: Port Everglades → San Juan
  { id: "lane-jones-pev-sjn", from: [26.09, -80.12], to: [18.46, -66.12] },
  // Hong Kong → Long Beach
  { id: "lane-hk-longbeach", from: [22.32, 114.17], to: [33.75, -118.2] },
];

const defaultMarkers: FlightMarker[] = [
  { id: "port-longbeach", location: [33.75, -118.2] }, // Long Beach, CA
  { id: "port-la", location: [33.73, -118.26] }, // Los Angeles, CA
  { id: "port-hueneme", location: [34.15, -119.21] }, // Port Hueneme ("Wainimi")
  { id: "port-oakland", location: [37.8, -122.32] }, // Oakland
  { id: "port-seattle", location: [47.6, -122.33] }, // Seattle
  { id: "port-honolulu", location: [21.31, -157.87] }, // Honolulu
  { id: "port-everglades", location: [26.09, -80.12] }, // Port Everglades
  { id: "port-sanjuan", location: [18.46, -66.12] }, // San Juan, PR
  { id: "port-cartagena", location: [10.4, -75.52] }, // Cartagena, CO
  { id: "port-balboa", location: [8.96, -79.57] }, // Balboa (Panama)
  { id: "port-rotterdam", location: [51.95, 4.14] }, // Rotterdam
  { id: "port-hamburg", location: [53.54, 9.98] }, // Hamburg
  { id: "port-qingdao", location: [36.07, 120.38] }, // Qingdao
  { id: "port-shanghai", location: [31.37, 121.5] }, // Shanghai
  { id: "port-hongkong", location: [22.32, 114.17] }, // Hong Kong
  { id: "port-singapore", location: [1.26, 103.8] }, // Singapore
  { id: "port-yokohama", location: [35.45, 139.65] }, // Yokohama
  { id: "port-santos", location: [-23.96, -46.33] }, // Santos, Brazil
  { id: "port-vancouver", location: [49.28, -123.12] }, // Vancouver
];

export function GlobeFlights({
  arcs = defaultArcs,
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobeFlightsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = 0;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 0.05,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 8,
        baseColor: [0.98, 0.98, 1],
        markerColor: [0.3, 0.55, 0.95],
        glowColor: [0.94, 0.93, 0.91],
        markerElevation: 0,
        markers: markers.map((m) => ({
          location: m.location,
          size: 0.02,
          id: m.id,
        })),
        arcs: arcs.map((a) => ({ from: a.from, to: a.to, id: a.id })),
        arcColor: [0.35, 0.6, 1],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.7,
      });
      function animate() {
        if (!isPausedRef.current) phi += speed;
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        });
        animationId = requestAnimationFrame(animate);
      }
      animate();
      setTimeout(() => canvas && (canvas.style.opacity = "1"));
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, arcs, speed]);

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="sticker-outline-flight">
            <feMorphology
              in="SourceAlpha"
              result="Dilated"
              operator="dilate"
              radius="2"
            />
            <feFlood floodColor="#ffffff" result="OutlineColor" />
            <feComposite
              in="OutlineColor"
              in2="Dilated"
              operator="in"
              result="Outline"
            />
            <feMerge>
              <feMergeNode in="Outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {arcs.map((a) => (
        <div
          key={a.id}
          style={{
            position: "absolute",
            positionAnchor: `--cobe-arc-${a.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            fontSize: "1.2rem",
            pointerEvents: "none" as const,
            filter:
              "url(#sticker-outline-flight) drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
            opacity: `var(--cobe-visible-arc-${a.id}, 0)`,
            transition: "opacity 0.3s, filter 0.3s",
          }}
        >
          🚢
        </div>
      ))}
    </div>
  );
}
