/**
 * ================================================================
 * Olintra — Tool Loader
 * ================================================================
 * Server-side helper: DB se tool + inputs + datasets + content load karta hai.
 * Datasets array → keyed object (fast lookup ke liye)
 * Contents array → keyed object (blockType se lookup)
 * ================================================================
 */

import { db } from "./db";

export type ToolInputDTO = {
  fieldKey: string;
  label: string;
  fieldType: string;
  validation: unknown;
  options: unknown;
  displayOrder: number;
};

export type LoadedTool = {
  tool: {
    id: string;
    slug: string;
    name: string;
    category: string | null;
    seoTitle: string | null;
    metaDesc: string | null;
  };
  inputs: ToolInputDTO[];
  datasets: Record<string, unknown>;
  content: Record<string, unknown>;
};

export async function loadTool(slug: string): Promise<LoadedTool | null> {
   "use cache";
  const tool = await db.tool.findUnique({
    where: { slug },
    include: {
      inputs: { orderBy: { displayOrder: "asc" } },
      datasets: true,
      contents: { orderBy: { orderIdx: "asc" } },
    },
  });

  if (!tool) return null;

  const datasets: Record<string, unknown> = {};
  for (const ds of tool.datasets) {
    datasets[ds.datasetKey] = ds.payload;
  }

  const content: Record<string, unknown> = {};
  for (const c of tool.contents) {
    content[c.blockType] = c.content;
  }

  return {
    tool: {
      id: tool.id,
      slug: tool.slug,
      name: tool.name,
      category: tool.category,
      seoTitle: tool.seoTitle,
      metaDesc: tool.metaDesc,
    },
    inputs: tool.inputs.map((i) => ({
      fieldKey: i.fieldKey,
      label: i.label,
      fieldType: i.fieldType,
      validation: i.validation,
      options: i.options,
      displayOrder: i.displayOrder,
    })),
    datasets,
    content,
  };
}