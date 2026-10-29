"use client";

import { useState } from "react";
import type { ToolInputDTO } from "@/lib/tool-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Preset = { label: string; expression: string };

type Props = {
  inputs: ToolInputDTO[];
  presets: Preset[];
  loading: boolean;
  onSubmit: (values: Record<string, string>) => void;
};

const VISUAL_KEYS = [
  "minute",
  "hour",
  "day_of_month",
  "month",
  "day_of_week",
  "seconds",
];

const NON_VISUAL_KEYS = ["format", "timezone", "next_count", "expression"];

export function DynamicForm({ inputs, presets, loading, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, string>>({
    format: "5-field",
    timezone: "UTC",
    next_count: "5",
  });

  function handleFieldChange(key: string, value: string) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // Visual field change → expression becomes stale, clear it.
      if (VISUAL_KEYS.includes(key)) {
        delete next.expression;
      }
      return next;
    });
  }

  function handlePreset(preset: Preset) {
  setValues((prev) => ({
    // Presets are 5-field — auto-align format to prevent mismatch
    format: "5-field",
    timezone: prev.timezone ?? "UTC",
    next_count: prev.next_count ?? "5",
    expression: preset.expression,
  }));
}

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  const formatField = inputs.find((i) => i.fieldKey === "format");
  const timezoneField = inputs.find((i) => i.fieldKey === "timezone");
  const nextCountField = inputs.find((i) => i.fieldKey === "next_count");
  const expressionField = inputs.find((i) => i.fieldKey === "expression");

  const allVisual = inputs.filter(
    (i) => !NON_VISUAL_KEYS.includes(i.fieldKey)
  );
  const activeVisual =
    values.format === "6-field"
      ? allVisual
      : allVisual.filter((f) => f.fieldKey !== "seconds");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-zinc-900">
            Build your schedule
          </CardTitle>
          <CardDescription>
            Paste an expression, pick a preset, or use the visual builder below.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Format + Timezone */}
          <div className="grid gap-4 sm:grid-cols-2">
            {formatField && (
              <FieldRenderer
                field={formatField}
                value={values.format ?? ""}
                onChange={(v) => handleFieldChange("format", v)}
              />
            )}
            {timezoneField && (
              <FieldRenderer
                field={timezoneField}
                value={values.timezone ?? ""}
                onChange={(v) => handleFieldChange("timezone", v)}
              />
            )}
          </div>

          <Separator />

          {/* Expression input */}
          {expressionField && (
            <div className="space-y-2">
              <Label
                htmlFor="field-expression"
                className="text-sm font-medium text-zinc-900"
              >
                Cron expression
                <span className="ml-2 text-xs font-normal text-zinc-500">
                  (optional — overrides fields below if provided)
                </span>
              </Label>
              <Input
  id="field-expression"
  placeholder={
    values.format === "6-field"
      ? "e.g. 0 */5 * * * *"
      : "e.g. */5 * * * *"
  }
  value={values.expression ?? ""}
  onChange={(e) => handleFieldChange("expression", e.target.value)}
/>
            </div>
          )}

          {/* Presets */}
          {presets.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-900">
                Quick presets
              </Label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePreset(p)}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98]"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Visual builder */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-zinc-900">
              Or build visually
            </Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {activeVisual.map((field) => (
                <FieldRenderer
                  key={field.fieldKey}
                  field={field}
                  value={values[field.fieldKey] ?? ""}
                  onChange={(v) => handleFieldChange(field.fieldKey, v)}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Next count */}
          {nextCountField && (
            <div className="max-w-xs">
              <FieldRenderer
                field={nextCountField}
                value={values.next_count ?? "5"}
                onChange={(v) => handleFieldChange("next_count", v)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full bg-zinc-900 text-base font-semibold text-white hover:bg-zinc-800 active:bg-zinc-950"
        disabled={loading}
      >
        {loading ? "Calculating…" : "Generate Schedule"}
      </Button>
    </form>
  );
}

// ----------------------------------------------------------------
// Field renderer — sab field types handle karta hai
// ----------------------------------------------------------------
type Validation = {
  min?: number;
  max?: number;
  required?: boolean;
  maxLength?: number;
  description?: string;
};

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ToolInputDTO;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = `field-${field.fieldKey}`;
  const validation = field.validation as Validation | undefined;

  if (field.fieldType === "select") {
    const options =
      (field.options as { label: string; value: string }[] | undefined) ?? [];
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-xs font-medium text-zinc-700">
          {field.label}
        </Label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const isNumberish = field.fieldType === "number";
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-zinc-700">
        {field.label}
        {validation?.description && (
          <span className="ml-1 font-normal text-zinc-400">
            ({validation.description})
          </span>
        )}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode={isNumberish ? "numeric" : "text"}
        placeholder="*"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={validation?.maxLength}
        className="h-10 font-mono text-sm"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}