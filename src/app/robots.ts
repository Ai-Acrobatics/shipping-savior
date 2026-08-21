import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /handoff/* is a token-gated customs broker package (AI-12018). The page
      // sets noindex itself, but a crawler that never fetches it cannot leak the
      // token through a referer or a cached snippet in the first place.
      disallow: ["/api/", "/platform/", "/admin/", "/handoff/"],
    },
    sitemap: "https://shipping-savior.vercel.app/sitemap.xml",
    host: "https://shipping-savior.vercel.app",
  };
}
