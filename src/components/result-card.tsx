"use client";

import { useState } from "react";
import type { CalcResult } from "@/lib/engine/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, Clock, Copy } from "lucide-react";

type Props = {
  result: CalcResult | null;
  error: string | null;
  loading: boolean;
};

export function ResultCard({ result, error, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200" />
          <div className="h-12 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-start gap-3 p-6">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Invalid input</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="border-dashed border-zinc-300 bg-white/50">
        <CardContent className="p-8 text-center">
          <Clock className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
          <p className="text-sm text-zinc-500">
            Fill the form and click{" "}
            <span className="font-medium text-zinc-700">Generate</span> to see
            your cron schedule here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-zinc-900">Your schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopyableExpression
            expression={result.expression ?? String(result.value)}
          />

          {result.description && (
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
              <p className="text-sm text-zinc-700">
                <span className="font-medium text-zinc-900">Meaning: </span>
                {result.description}
              </p>
            </div>
          )}

          {result.warnings && result.warnings.length > 0 && (
            <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3">
              {result.warnings.map((w, i) => (
                <p
                  key={i}
                  className="flex items-start gap-2 text-xs text-amber-900"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>{w}</span>
                </p>
              ))}
            </div>
          )}

          {result.nextRuns && result.nextRuns.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-900">
                Next {result.nextRuns.length} runs
              </p>
              <div className="space-y-1.5">
                {result.nextRuns.map((run, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2"
                  >
                    <span className="font-mono text-xs text-zinc-400">
                      #{i + 1}
                    </span>
                    <span className="font-mono text-xs text-zinc-900 sm:text-sm">
                      {run.local}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result.breakdown && result.breakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-700">
              Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {result.breakdown.map((item, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-4 text-sm"
                >
                  <dt className="capitalize text-zinc-500">{item.label}</dt>
                  <dd className="break-all font-mono text-xs text-zinc-900">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {result.disclaimer && (
        <p className="px-1 text-xs leading-relaxed text-zinc-500">
          {result.disclaimer}
        </p>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Copy button + dark code block
// ----------------------------------------------------------------
function CopyableExpression({ expression }: { expression: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(expression);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard failure — silent
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs text-zinc-500">Cron expression</p>
      <div className="flex items-stretch gap-2">
        <code className="flex flex-1 items-center overflow-x-auto break-all rounded-lg bg-zinc-900 px-4 py-3 font-mono text-base text-zinc-50 sm:text-lg">
          {expression}
        </code>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          className="h-auto flex-shrink-0 px-3"
          aria-label={copied ? "Copied" : "Copy expression"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}