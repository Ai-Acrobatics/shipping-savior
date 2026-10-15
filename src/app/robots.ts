import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /handoff/* (AI-12018) and /track/* (AI-12022) are token-gated share
      // links. Both pages set noindex themselves, but keeping crawlers off the
      // paths entirely means a token pasted somewhere public never gets indexed.
      disallow: ["/api/", "/platform/", "/admin/", "/handoff/", "/track/"],
    },
    sitemap: "https://shipping-savior.vercel.app/sitemap.xml",
    host: "https://shipping-savior.vercel.app",
  };
}
