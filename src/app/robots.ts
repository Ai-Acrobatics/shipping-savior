import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/platform/", "/admin/"],
    },
    sitemap: "https://shipping-savior.vercel.app/sitemap.xml",
    host: "https://shipping-savior.vercel.app",
  };
}
