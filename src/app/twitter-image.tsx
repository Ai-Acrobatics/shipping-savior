// Twitter card image — reuses the OG image renderer for visual consistency.
// Next.js convention: this file is auto-served at /twitter-image and
// included in the Twitter card metadata for the root segment.

import OpengraphImage from "./opengraph-image";

// Route-segment config for the Twitter image (must be string literals so Next
// can statically extract them at build time)
export const runtime = "edge";
export const alt = "Shipping Savior — International logistics intelligence";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default OpengraphImage;
