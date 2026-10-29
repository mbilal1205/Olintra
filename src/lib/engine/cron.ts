/**
 * ================================================================
 * Olintra — Cron Engine
 * ================================================================
 *
 * Input:  CalcInput (raw expression OR visual fields + format + timezone)
 * Output: CalcResult (normalized expression, description, next runs, etc.)
 *
 * Dependencies:
 *  - cron-parser v5  → parse + validate + next run times
 *  - cronstrue       → plain-English description
 *
 * Client-side safe: pure function, no DB calls, no side effects.
 * ================================================================
 */

import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";
import type { CalcInput, CalcResult, NextRun } from "./types";

// ----------------------------------------------------------------
// SECTION A: Macro expansion
// ----------------------------------------------------------------
const CRON_MACROS: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

function expandMacro(expression: string): { expanded: string; isMacro: boolean } {
  const trimmed = expression.trim().toLowerCase();
  if (trimmed in CRON_MACROS) {
    return { expanded: CRON_MACROS[trimmed], isMacro: true };
  }
  return { expanded: expression.trim(), isMacro: false };
}

// ----------------------------------------------------------------
// SECTION B: Build expression from input
// Priority: raw expression > visual fields.
// ----------------------------------------------------------------
function buildExpression(input: CalcInput, format: string): string {
  const raw = typeof input.expression === "string" ? input.expression.trim() : "";
  if (raw.length > 0) {
    return raw;
  }

  // Check: agar koi bhi visual field nahi diya, to error
  const visualKeys =
    format === "6-field"
      ? ["seconds", "minute", "hour", "day_of_month", "month", "day_of_week"]
      : ["minute", "hour", "day_of_month", "month", "day_of_week"];

  const hasAnyVisual = visualKeys.some(
    (k) => input[k] !== undefined && input[k] !== null && input[k] !== ""
  );

  if (!hasAnyVisual) {
    throw new Error(
      "Cron expression is required. Provide one, or fill at least one visual field."
    );
  }

  // Visual fields se build — missing fields "*" ho jayengi
  const pick = (key: string): string => {
    const v = input[key];
    if (v === undefined || v === null || v === "") return "*";
    return String(v).trim();
  };

  if (format === "6-field") {
    return [
      pick("seconds"),
      pick("minute"),
      pick("hour"),
      pick("day_of_month"),
      pick("month"),
      pick("day_of_week"),
    ].join(" ");
  }
  return [
    pick("minute"),
    pick("hour"),
    pick("day_of_month"),
    pick("month"),
    pick("day_of_week"),
  ].join(" ");
}

// ----------------------------------------------------------------
// SECTION C: Format date in target timezone
// ----------------------------------------------------------------
function formatLocal(date: Date, tz: string): string {
  const datePart = date.toLocaleDateString("en-CA", { timeZone: tz });
  const timePart = date.toLocaleTimeString("en-GB", {
    timeZone: tz,
    hour12: false,
  });
  return `${datePart} ${timePart}`;
}

// ----------------------------------------------------------------
// SECTION D: Split expression into fields + meaning
// ----------------------------------------------------------------
type FieldMeaning = { field: string; value: string; meaning: string };

function describeFields(expression: string, format: string): FieldMeaning[] {
  const parts = expression.trim().split(/\s+/);
  const labels5 = ["minute", "hour", "day-of-month", "month", "day-of-week"];
  const labels6 = ["seconds", ...labels5];
  const labels = format === "6-field" ? labels6 : labels5;

  return parts.map((value, i) => ({
    field: labels[i] ?? `field-${i + 1}`,
    value,
    meaning: value === "*" ? "every value" : value,
  }));
}

// ----------------------------------------------------------------
// SECTION E: Detect day-of-month + day-of-week OR logic
// ----------------------------------------------------------------
function detectDomDowWarning(
  expression: string,
  format: string
): string | null {
  const parts = expression.trim().split(/\s+/);
  const domIdx = format === "6-field" ? 3 : 2;
  const dowIdx = format === "6-field" ? 5 : 4;
  const dom = parts[domIdx];
  const dow = parts[dowIdx];
  if (!dom || !dow) return null;
  if (dom !== "*" && dow !== "*") {
    return `Both day-of-month and day-of-week are restricted. Standard cron uses OR logic — the job runs on either condition.`;
  }
  return null;
}

// ----------------------------------------------------------------
// SECTION F: MAIN ENGINE
// ----------------------------------------------------------------
export async function cronEngine(input: CalcInput): Promise<CalcResult> {
  const format = (input.format as string) || "5-field";
  const timezone = (input.timezone as string) || "UTC";
  const nextCount = Number(input.next_count) || 5;
  const warnings: string[] = [];

  // 1. Build expression
  const rawExpression = buildExpression(input, format);
  if (!rawExpression) {
    throw new Error("Cron expression is required. Provide one or fill the fields.");
  }

  // 2. Expand macro if any
  const { expanded, isMacro } = expandMacro(rawExpression);

  // 3. Validate field count matches selected format
  const fieldCount = expanded.trim().split(/\s+/).length;
  const expectedCount = format === "6-field" ? 6 : 5;

  if (fieldCount !== expectedCount) {
    let extraHint = "";
    if (fieldCount === 5 && format === "6-field") {
      extraHint =
        ' Either switch to 5-field format, or add a seconds field at the start (e.g. "0 */5 * * * *").';
    } else if (fieldCount === 6 && format === "5-field") {
      extraHint =
        ' Either switch to 6-field format, or remove the seconds field.';
    } else {
      extraHint = " Please check your expression.";
    }
    throw new Error(
      `This expression has ${fieldCount} field${
        fieldCount === 1 ? "" : "s"
      }, but you selected "${format}" format which needs ${expectedCount} fields.${extraHint}`
    );
  }

  // 4. Validate timezone
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    throw new Error(
      `Invalid timezone: "${timezone}". Use an IANA timezone like "UTC" or "Asia/Karachi".`
    );
  }

  // 5. Parse expression
  let interval;
  try {
    interval = CronExpressionParser.parse(expanded, { tz: timezone });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid cron expression: ${msg}`);
  }

  // 6. Description
  let description = "";
  try {
    if (format === "6-field") {
      // cronstrue does not support 6-field natively.
      // Strategy: describe the 5 non-second fields, and prefix with seconds info.
      const parts = expanded.split(/\s+/);
      const seconds = parts[0];
      const fiveField = parts.slice(1).join(" ");
      const baseDesc = cronstrue.toString(fiveField, {
        use24HourTimeFormat: true,
        throwExceptionOnParseError: false,
      });

      if (seconds === "*") {
        description = `${baseDesc} (every second)`;
      } else if (seconds === "0") {
        // No need to mention "at second 0" — that's the default for most users.
        description = baseDesc;
      } else {
        description = `${baseDesc} (at second ${seconds})`;
      }
    } else {
      description = cronstrue.toString(expanded, {
        use24HourTimeFormat: true,
        throwExceptionOnParseError: false,
      });
    }
  } catch {
    description = "Unable to generate description";
  }

  // 7. Next N runs
  const nextRuns: NextRun[] = [];
  try {
    const dates = interval.take(nextCount);
    for (const dt of dates) {
      const jsDate = dt.toDate();
      nextRuns.push({
        iso: jsDate.toISOString(),
        local: formatLocal(jsDate, timezone),
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Could not compute next run times: ${msg}`);
  }

  // 8. Warnings
  if (isMacro) {
    warnings.push(`Macro "${rawExpression}" expanded to "${expanded}".`);
  }
  const domDowWarning = detectDomDowWarning(expanded, format);
  if (domDowWarning) warnings.push(domDowWarning);

  // 9. Breakdown
  const fieldsBreakdown = describeFields(expanded, format).map(
    ({ field, value, meaning }) => ({
      label: field,
      value: `${value} (${meaning})`,
    })
  );

  // 10. Return
  return {
    value: expanded,
    expression: expanded,
    description,
    nextRuns,
    breakdown: [
      { label: "Format", value: format },
      { label: "Timezone", value: timezone },
      ...fieldsBreakdown,
    ],
    warnings: warnings.length > 0 ? warnings : undefined,
    notes: isMacro
      ? [`Original input was a macro: ${rawExpression}`]
      : undefined,
    disclaimer:
      "Cron runs use server timezone unless your scheduler specifies one. Verify on your deployment platform.",
  };
}

// ----------------------------------------------------------------
// SECTION G: Named export for tests
// ----------------------------------------------------------------
export const __internal = {
  buildExpression,
  expandMacro,
  detectDomDowWarning,
  formatLocal,
};