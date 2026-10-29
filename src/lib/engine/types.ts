// Tool Engine ke standard types — har tool yeh follow karega
export type CalcInput = Record<string, string | number | boolean>;

export interface CalcBreakdownItem {
  label: string;
  value: string;
}

export interface NextRun {
  iso: string;
  local: string;
}

export interface CalcResult {
  value: number | string;
  breakdown: CalcBreakdownItem[];
  notes?: string[];
  disclaimer?: string;
  // Cron-specific (optional — doosre tools ignore karenge)
  description?: string;
  nextRuns?: NextRun[];
  expression?: string;
  warnings?: string[];
}

export type Dataset = Record<string, unknown>;

export interface ToolEngine {
  (input: CalcInput, dataset?: Dataset): Promise<CalcResult> | CalcResult;
}