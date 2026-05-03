"use client";

/**
 * LogoMarquee — continuous horizontal scroll showing carrier / partner logos.
 *
 * Uses pure CSS keyframe animation (`@keyframes marquee` defined in
 * src/app/globals.css). Logos are rendered as clean text wordmarks in
 * grayscale that brighten on hover. Per AI-8870 we keep brand names
 * generic-shipping (no Trader Joe's, no Chiquita name-drop).
 *
 * Mounted on the home page between the hero and the 3D globe section
 * with the heading "Trusted across global supply chains".
 */

const LOGOS: string[] = [
  "Maersk",
  "MSC",
  "CMA CGM",
  "Hapag-Lloyd",
  "ONE",
  "Matson",
  "Pasha Hawaii",
  "Lineage",
  "Hall Pass",
];

interface LogoMarqueeProps {
  /** Override the section heading. */
  heading?: string;
  /** Override the logo list. */
  logos?: string[];
  /** Animation speed in seconds (default 40s). */
  durationSec?: number;
}

export function LogoMarquee({
  heading = "Trusted across global supply chains",
  logos = LOGOS,
  durationSec = 40,
}: LogoMarqueeProps) {
  return (
    <section
      aria-label="Trusted partners and carriers"
      className="relative py-14 md:py-16 border-y border-ocean-50 bg-white overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-6 mb-8 text-center">
        <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-navy-400 font-medium">
          {heading}
        </p>
      </div>

      <div
        className="flex overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        role="presentation"
      >
        <div
          className="flex shrink-0 motion-reduce:animate-none"
          style={{
            animation: `marquee ${durationSec}s linear infinite`,
          }}
        >
          {[...logos, ...logos].map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="mx-8 sm:mx-10 md:mx-14 flex items-center justify-center flex-shrink-0"
            >
              <span className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LogoMarquee;
