import Link from "next/link";
import { Suspense } from "react";
import { listLiveTools } from "@/lib/tools-list";
import { AdSlot } from "@/components/AdsComponent/ad-slot";

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
          Free · No signup · Private
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
          Tools that just work.
        </h1>
        <p className="mt-4 text-base text-zinc-600 md:text-lg">
          Fast, focused utilities for developers and professionals. Everything
          runs in your browser — nothing is stored on our servers.
        </p>
      </section>

      {/* Top Ad */}
      <AdSlot slotId="home-top" minHeight={90} className="mt-10" />

      {/* Tools Grid */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          All tools
        </h2>
        <Suspense fallback={<ToolsGridSkeleton />}>
          <ToolsGrid />
        </Suspense>
      </section>

      {/* Why Olintra */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Why Olintra
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "100% private",
              body: "Every calculation runs in your browser. No data ever leaves your device.",
            },
            {
              title: "No signup, no ads clutter",
              body: "Open, use, done. No accounts, no paywalls, no distracting overlays.",
            },
            {
              title: "Built for pros",
              body: "Accurate formulas, real-world edge cases, and clear explanations — not just outputs.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-200 bg-white p-5"
            >
              <h3 className="text-sm font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Ad */}
      <AdSlot slotId="home-bottom" minHeight={90} className="mt-12" />
    </div>
  );
}

// ----------------------------------------------------------------
// Tools Grid (server component — DB fetch)
// ----------------------------------------------------------------
async function ToolsGrid() {
  const tools = await listLiveTools();

  if (tools.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
        No tools available yet. Check back soon.
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <Link
          key={tool.slug}
          href={`/${tool.slug}`}
          className="group rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-950">
              {tool.name}
            </h3>
            <span className="text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-700">
              →
            </span>
          </div>
          {tool.metaDesc && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600">
              {tool.metaDesc}
            </p>
          )}
          {tool.category && (
            <span className="mt-4 inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-600">
              {tool.category}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

function ToolsGridSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5"
        >
          <div className="h-5 w-2/3 rounded bg-zinc-200" />
          <div className="mt-3 h-3.5 w-full rounded bg-zinc-200" />
          <div className="mt-2 h-3.5 w-4/5 rounded bg-zinc-200" />
        </div>
      ))}
    </div>
  );
}