"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type LngLatBoundsLike, type MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { VesselLane } from "@/lib/vessel-map/lanes";
import { boundsOf } from "@/lib/vessel-map/geo";
import {
  LANE_COLORS,
  laneFeatures,
  popupHtml,
  portFeatures,
  vesselFeatures,
} from "@/lib/vessel-map/features";

// ── Style ──────────────────────────────────────────────
//
// MapLibre's demo tiles need no API key, so the map works on a fresh checkout.
// Point NEXT_PUBLIC_MAP_STYLE_URL at MapTiler/Protomaps for production basemaps.
const DEFAULT_STYLE_URL = "https://demotiles.maplibre.org/style.json";

const SOURCE_LANES = "vessel-lanes";
const SOURCE_PORTS = "vessel-ports";
const SOURCE_VESSELS = "vessel-positions";

interface VesselMapProps {
  lanes: VesselLane[];
  /** Shipment id to fly to and highlight. */
  selectedShipmentId?: string | null;
  onSelectShipment?: (shipmentId: string | null) => void;
  className?: string;
}

/**
 * MapLibre vessel map (AI-12012). Renders great-circle lane arcs, port markers,
 * and one vessel marker per lane — live when AIS matched, estimated otherwise.
 */
export default function VesselMap({
  lanes,
  selectedShipmentId,
  onSelectShipment,
  className = "",
}: VesselMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [ready, setReady] = useState(false);
  const [styleError, setStyleError] = useState<string | null>(null);

  const data = useMemo(
    () => ({
      lanes: laneFeatures(lanes),
      ports: portFeatures(lanes),
      vessels: vesselFeatures(lanes),
    }),
    [lanes]
  );

  // ── Map init (once) ──────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_STYLE_URL,
      center: [0, 20],
      zoom: 1.1,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");
    map.on("error", (e) => {
      // A missing/blocked basemap style should not blank the whole page.
      console.error("[vessel-map] maplibre error:", e?.error ?? e);
      setStyleError("Basemap tiles failed to load. Lanes and vessels are still plotted.");
    });

    map.on("load", () => {
      map.addSource(SOURCE_LANES, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addSource(SOURCE_PORTS, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addSource(SOURCE_VESSELS, { type: "geojson", data: { type: "FeatureCollection", features: [] } });

      map.addLayer({
        id: "lane-casing",
        type: "line",
        source: SOURCE_LANES,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#0f172a", "line-width": 4, "line-opacity": 0.35 },
      });
      map.addLayer({
        id: "lane-line",
        type: "line",
        source: SOURCE_LANES,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 4, 2],
          "line-opacity": 0.9,
        },
      });
      map.addLayer({
        id: "port-circle",
        type: "circle",
        source: SOURCE_PORTS,
        paint: {
          "circle-radius": 4,
          "circle-color": ["match", ["get", "role"], "origin", "#fbbf24", "#22d3ee"],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#0f172a",
        },
      });
      map.addLayer({
        id: "port-label",
        type: "symbol",
        source: SOURCE_PORTS,
        layout: {
          "text-field": ["get", "locode"],
          "text-size": 10,
          "text-offset": [0, 1.1],
          "text-anchor": "top",
          "text-allow-overlap": false,
        },
        paint: { "text-color": "#0f172a", "text-halo-color": "#ffffff", "text-halo-width": 1.2 },
      });
      map.addLayer({
        id: "vessel-halo",
        type: "circle",
        source: SOURCE_VESSELS,
        paint: {
          "circle-radius": 9,
          "circle-color": ["get", "color"],
          "circle-opacity": ["case", ["boolean", ["get", "live"], false], 0.28, 0.14],
        },
      });
      map.addLayer({
        id: "vessel-point",
        type: "circle",
        source: SOURCE_VESSELS,
        paint: {
          "circle-radius": 5,
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2,
          // Live fixes get a white ring; estimates get a dashed-looking slate ring.
          "circle-stroke-color": ["case", ["boolean", ["get", "live"], false], "#ffffff", "#475569"],
        },
      });

      map.on("mouseenter", "vessel-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "vessel-point", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("click", "vessel-point", (e) => {
        const feature = e.features?.[0] as MapGeoJSONFeature | undefined;
        if (!feature) return;
        const props = feature.properties as Record<string, unknown>;
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: "320px" })
          .setLngLat((feature.geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(popupHtml(props))
          .addTo(map);
        onSelectShipment?.(String(props.shipmentId));
      });

      setReady(true);
    });

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
    // onSelectShipment is read through a ref-free closure on purpose: the map is
    // built once and callbacks are stable for the page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Data updates ─────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource(SOURCE_LANES) as maplibregl.GeoJSONSource | undefined)?.setData(data.lanes);
    (map.getSource(SOURCE_PORTS) as maplibregl.GeoJSONSource | undefined)?.setData(data.ports);
    (map.getSource(SOURCE_VESSELS) as maplibregl.GeoJSONSource | undefined)?.setData(data.vessels);
  }, [data, ready]);

  // ── Fit to all lanes when the lane set changes ───────
  const fitToLanes = useCallback(() => {
    const map = mapRef.current;
    if (!map || lanes.length === 0) return;

    // Compute the extent over *unwrapped* longitudes. `LngLatBounds.extend`
    // normalizes each point into ±180 first, which collapses a trans-Pacific
    // lane (121°E → 241°) into a bogus world-spanning box and over-zooms.
    const points: [number, number][] = [];
    for (const lane of lanes) {
      points.push(...lane.path);
      points.push([lane.vessel.lng, lane.vessel.lat]);
    }
    const extent = boundsOf(points);
    if (!extent) return;

    const [west, south, east, north] = extent;
    map.fitBounds(
      [
        [west, south],
        [east, north],
      ] as LngLatBoundsLike,
      { padding: 60, maxZoom: 5, duration: 600 }
    );
  }, [lanes]);

  useEffect(() => {
    if (!ready) return;
    fitToLanes();
  }, [ready, fitToLanes]);

  // ── Fly to an externally selected shipment ───────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !selectedShipmentId) return;
    const lane = lanes.find((l) => l.shipmentId === selectedShipmentId);
    if (!lane) return;
    map.flyTo({ center: [lane.vessel.lng, lane.vessel.lat], zoom: 4, duration: 800 });
  }, [selectedShipmentId, lanes, ready]);

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="h-full w-full rounded-xl overflow-hidden" data-testid="vessel-map-canvas" />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 border border-navy-200 px-3 py-2 shadow-sm text-[11px] text-navy-700">
        <div className="font-semibold text-navy-900 mb-1">Lane status</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          {Object.entries(LANE_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{status.replace("_", " ")}</span>
            </div>
          ))}
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-navy-200 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-400 ring-2 ring-white" />
            Live AIS
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-400 ring-2 ring-slate-500" />
            Estimated
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={fitToLanes}
        className="absolute top-3 left-3 rounded-lg bg-white/95 border border-navy-200 px-2.5 py-1.5 text-[11px] font-semibold text-navy-700 shadow-sm hover:bg-white"
      >
        Fit all lanes
      </button>

      {styleError && (
        <div className="absolute top-3 right-14 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[11px] text-amber-800 shadow-sm max-w-[240px]">
          {styleError}
        </div>
      )}
    </div>
  );
}
