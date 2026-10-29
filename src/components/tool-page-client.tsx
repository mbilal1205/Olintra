"use client";

import { useState } from "react";
import type { CalcResult } from "@/lib/engine/types";
import type { LoadedTool, ToolInputDTO } from "@/lib/tool-loader";
import { DynamicForm } from "@/components/dynamic-form";
import { ResultCard } from "@/components/result-card";

type Preset = { label: string; expression: string };

type Props = {
  tool: LoadedTool["tool"];
  inputs: ToolInputDTO[];
  datasets: Record<string, unknown>;
  content: Record<string, unknown>;
};

export function ToolPageClient({ tool, inputs, datasets, content }: Props) {
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const intro = content.intro as
    | { heading?: string; body?: string }
    | undefined;
  const presets = (datasets.presets as Preset[] | undefined) ?? [];

  async function handleCalculate(values: Record<string, string>) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tools/${tool.slug}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: values }),
      });

      const data = (await res.json()) as
        | { result: CalcResult }
        | { error: string };

      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Calculation failed");
        setResult(null);
      } else {
        setResult(data.result);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
          {intro?.heading || tool.name}
        </h1>
        {intro?.body && (
          <p className="mt-3 max-w-3xl text-base text-zinc-600 md:text-lg">
            {intro.body}
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <div className="min-w-0">
          <DynamicForm
            inputs={inputs}
            presets={presets}
            loading={loading}
            onSubmit={handleCalculate}
          />
        </div>

        <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <ResultCard result={result} error={error} loading={loading} />
        </div>
      </div>
    </div>
  );
}