import { MetadataRoute } from "next";
import { getAllArticleMeta } from "@/lib/kb";

const baseUrl = "https://shipping-savior.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/demo`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/calculators`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/dashboard`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/carrier-comparison`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/ftz-analyzer`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/routes`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/port-finder`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/data-intelligence`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/knowledge-base`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/platform-architecture`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/tech-spec`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/six-sigma`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/phases`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/monetization`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/jv-agreement`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/agreement`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/agent-plan`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/file-cards`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/globe`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/v0-chat`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    // Auth routes (low priority, yearly change)
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/forgot-password`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/verify-email`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Dynamic KB articles — iterate over MDX files
  let kbRoutes: MetadataRoute.Sitemap = [];
  try {
    kbRoutes = getAllArticleMeta().map((article) => ({
      url: `${baseUrl}/knowledge-base/${article.slug}`,
      lastModified: article.updated_at
        ? new Date(article.updated_at)
        : article.published_at
          ? new Date(article.published_at)
          : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Defensive: if KB load fails at build time, sitemap still ships static routes
    kbRoutes = [];
  }

  return [...staticRoutes, ...kbRoutes];
}
