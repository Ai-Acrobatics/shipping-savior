import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/platform/", "/api/"],
    },
    sitemap: "https://shipping-savior.vercel.app/sitemap.xml",
  };
}
