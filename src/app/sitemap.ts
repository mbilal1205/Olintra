import type { MetadataRoute } from "next";
import { listLiveTools } from "@/lib/tools-list";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olintra.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await listLiveTools();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...tools.map((tool) => ({
      url: `${SITE_URL}/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}