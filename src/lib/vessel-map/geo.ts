// ── Great-circle geometry for the vessel map (AI-12012) ───────────────
//
// MapLibre draws GeoJSON LineStrings in raw lng/lat, so a Pacific lane like
// Shanghai → Long Beach (121.47 → -118.20) renders as a line straight back
// across Eurasia unless the longitudes stay *continuous* past ±180. Every
// helper here therefore emits unwrapped longitudes (values beyond ±180 are
// intentional and legal for MapLibre) instead of re-wrapping each vertex.

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371.0088;

export const toRadians = (deg: number): number => (deg * Math.PI) / 180;
export const toDegrees = (rad: number): number => (rad * 180) / Math.PI;

/** Wrap any longitude into [-180, 180). */
export function wrapLongitude(lng: number): number {
  const wrapped = ((lng + 180) % 360 + 360) % 360;
  return wrapped - 180;
}

/**
 * Shortest-path longitude for `to` expressed relative to `from`.
 * Returns a value that may exceed ±180 so the pair stays continuous.
 */
export function unwrapLongitude(from: number, to: number): number {
  let delta = to - from;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return from + delta;
}

/** Great-circle (haversine) distance in kilometres. */
export function greatCircleDistanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(unwrapLongitude(a.lng, b.lng) - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Spherical linear interpolation along the great circle from `a` to `b`.
 * `fraction` is clamped to [0, 1]. The returned longitude is unwrapped
 * relative to `a`, so following a full path never jumps by ~360°.
 */
export function interpolateGreatCircle(a: LatLng, b: LatLng, fraction: number): LatLng {
  const f = Math.min(1, Math.max(0, fraction));
  const lngB = unwrapLongitude(a.lng, b.lng);

  const lat1 = toRadians(a.lat);
  const lng1 = toRadians(a.lng);
  const lat2 = toRadians(b.lat);
  const lng2 = toRadians(lngB);

  const d =
    2 *
    Math.asin(
      Math.min(
        1,
        Math.sqrt(
          Math.sin((lat2 - lat1) / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2
        )
      )
    );

  // Coincident endpoints (or a degenerate arc) — nothing to interpolate.
  if (d === 0 || !Number.isFinite(d)) {
    return { lat: a.lat, lng: a.lng };
  }

  const A = Math.sin((1 - f) * d) / Math.sin(d);
  const B = Math.sin(f * d) / Math.sin(d);

  const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
  const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);

  return {
    lat: toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lng: toDegrees(Math.atan2(y, x)),
  };
}

/**
 * Great-circle path as GeoJSON `[lng, lat]` pairs with continuous longitudes.
 *
 * `steps` is the number of segments (so the result has `steps + 1` points).
 * The final point is the true destination, not an interpolated approximation,
 * so arcs always terminate exactly on the port marker.
 */
export function greatCirclePath(a: LatLng, b: LatLng, steps = 64): [number, number][] {
  const segments = Math.max(1, Math.floor(steps));
  const destLng = unwrapLongitude(a.lng, b.lng);
  const points: [number, number][] = [];

  let previousLng = a.lng;
  for (let i = 0; i <= segments; i += 1) {
    const point =
      i === segments
        ? { lat: b.lat, lng: destLng }
        : interpolateGreatCircle(a, b, i / segments);
    // atan2 re-wraps into ±180; re-unwrap against the running longitude so the
    // whole path is monotonic across the antimeridian.
    const lng = i === segments ? destLng : unwrapLongitude(previousLng, point.lng);
    previousLng = lng;
    points.push([lng, point.lat]);
  }

  return points;
}

/** Initial great-circle bearing (degrees, 0 = north) from `a` toward `b`. */
export function initialBearing(a: LatLng, b: LatLng): number {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const dLng = toRadians(unwrapLongitude(a.lng, b.lng) - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

/** Bounding box `[west, south, east, north]` over unwrapped coordinates. */
export function boundsOf(points: [number, number][]): [number, number, number, number] | null {
  if (points.length === 0) return null;
  let west = points[0][0];
  let east = points[0][0];
  let south = points[0][1];
  let north = points[0][1];
  for (const [lng, lat] of points) {
    if (lng < west) west = lng;
    if (lng > east) east = lng;
    if (lat < south) south = lat;
    if (lat > north) north = lat;
  }
  return [west, south, east, north];
}
