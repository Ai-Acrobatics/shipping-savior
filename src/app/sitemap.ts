import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://shipping-savior.vercel.app";
  const now = new Date();

  return [
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
    { url: `${baseUrl}/knowledge-base`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/platform-architecture`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/tech-spec`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/six-sigma`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/phases`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/monetization`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/jv-agreement`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/agreement`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
