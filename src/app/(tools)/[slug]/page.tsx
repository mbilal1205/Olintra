import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadTool } from "@/lib/tool-loader";
import { getToolConfig } from "@/registry/tools.config";
import { ToolPageClient } from "@/components/tool-page-client";
import { ToolPageSkeleton } from "@/components/tool-page-skeleton";
import { ToolFaq } from "@/components/tool-faq";
import { ToolHowTo } from "@/components/tool-howto";
import { AdSlot } from "@/components/AdsComponent/ad-slot";
import {
  WebApplicationSchema,
  FAQPageSchema,
  BreadcrumbSchema,
} from "@/components/json-ld";

type Props = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadTool(slug);
  if (!loaded) return { title: "Tool not found" };

  return {
    title: loaded.tool.seoTitle || `${loaded.tool.name} — Olintra`,
    description: loaded.tool.metaDesc || undefined,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: loaded.tool.seoTitle || loaded.tool.name,
      description: loaded.tool.metaDesc || undefined,
      type: "website",
      url: `${SITE_URL}/${slug}`,
    },
  };
}

export default function ToolPage({ params }: Props) {
  return (
    <Suspense fallback={<ToolPageSkeleton />}>
      <ToolContent params={params} />
    </Suspense>
  );
}

async function ToolContent({ params }: Props) {
  const { slug } = await params;
  const loaded = await loadTool(slug);
  const config = getToolConfig(slug);

  if (!loaded || !config?.enabled) notFound();

  const intro = loaded.content.intro as
    | { heading?: string; body?: string }
    | undefined;
  const howto = loaded.content.howto as
    | { steps?: { name: string; text: string }[] }
    | undefined;
  const faqs = loaded.content.faq as { q: string; a: string }[] | undefined;

  return (
    <>
      {/* JSON-LD Schemas */}
      <WebApplicationSchema
        name={loaded.tool.name}
        description={loaded.tool.metaDesc || ""}
        url={`${SITE_URL}/${slug}`}
        category={loaded.tool.category ?? undefined}
      />
      {faqs && faqs.length > 0 && <FAQPageSchema faqs={faqs} />}
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: loaded.tool.name, url: `${SITE_URL}/${slug}` },
        ]}
      />

      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Breadcrumbs (visible) */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 text-xs text-zinc-500"
        >
          <a href="/" className="hover:text-zinc-900">
            Home
          </a>
          <span aria-hidden="true">/</span>
          <span className="text-zinc-700">{loaded.tool.name}</span>
        </nav>

        {/* H1 + Intro */}
        <header className="mb-8 md:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            {intro?.heading || loaded.tool.name}
          </h1>
          {intro?.body && (
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-600 md:text-lg">
              {intro.body}
            </p>
          )}
        </header>

        {/* Top Ad */}
        <AdSlot slotId={`${slug}-top`} minHeight={90} className="mb-8" />

        {/* Form + Result (existing client component) */}
        <ToolPageClient
          tool={loaded.tool}
          inputs={loaded.inputs}
          datasets={loaded.datasets}
          content={loaded.content}
        />

        {/* In-content Ad (between form and FAQ) */}
        <AdSlot
          slotId={`${slug}-mid`}
          format="rectangle"
          minHeight={250}
          className="mt-12"
        />

        {/* HowTo */}
        {howto?.steps && (
          <ToolHowTo steps={howto.steps} />
        )}

        {/* FAQ */}
        {faqs && <ToolFaq faqs={faqs} />}

        {/* Bottom Ad */}
        <AdSlot slotId={`${slug}-bottom`} minHeight={90} className="mt-12" />
      </div>
    </>
  );
}