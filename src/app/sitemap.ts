import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { CHANGELOG } from "@/data/changelog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const lastChangelog = new Date(`${CHANGELOG[0].date}T00:00:00Z`);
  const legalDate = new Date("2026-05-25T00:00:00Z");
  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/changelog`,
      lastModified: lastChangelog,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${site.url}/privacidad`,
      lastModified: legalDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/terminos`,
      lastModified: legalDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/arriendo`,
      lastModified: legalDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/aviso-legal`,
      lastModified: legalDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
