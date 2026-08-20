import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /track/* is a per-customer share link (AI-12022) — the page already
      // sends noindex, but keep crawlers off the path entirely so a token
      // pasted somewhere public never gets indexed.
      disallow: ["/api/", "/platform/", "/admin/", "/track/"],
    },
    sitemap: "https://shipping-savior.vercel.app/sitemap.xml",
    host: "https://shipping-savior.vercel.app",
  };
}
