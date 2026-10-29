import type { ToolEngine } from "@/lib/engine/types";
import { cronEngine } from "@/lib/engine/cron";

export type ToolConfig = {
  engine: ToolEngine;
  renderer?: "standard";
  locales?: string[];
  enabled: boolean;
};

export const TOOL_REGISTRY: Record<string, ToolConfig> = {
  "cron-generator": {
    engine: cronEngine,
    renderer: "standard",
    locales: ["en"],
    enabled: true,
  },
};

export function getToolConfig(slug: string): ToolConfig | null {
  return TOOL_REGISTRY[slug] ?? null;
}