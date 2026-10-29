/**
 * ================================================================
 * Olintra — Tools List Helper
 * ================================================================
 * Homepage, sitemap, aur future /tools page ke liye live tools list.
 * Dev mein draft bhi dikhte hain (testing ke liye), prod mein sirf live.
 * ================================================================
 */

import { db } from "./db";

export type ToolListItem = {
  slug: string;
  name: string;
  category: string | null;
  seoTitle: string | null;
  metaDesc: string | null;
};

export async function listLiveTools(): Promise<ToolListItem[]> {
  const where =
    process.env.NODE_ENV === "development"
      ? { status: { in: ["live", "draft"] } }
      : { status: "live" };

  const tools = await db.tool.findMany({
    where,
    select: {
      slug: true,
      name: true,
      category: true,
      seoTitle: true,
      metaDesc: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return tools;
}