type FAQItem = { q: string; a: string };

export function ToolFaq({ faqs }: { faqs: FAQItem[] }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
        Frequently asked questions
      </h2>
      <p className="mt-2 text-sm text-zinc-600">
        Common questions about cron expressions and this tool.
      </p>

      <div className="mt-6 space-y-2">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-lg border border-zinc-200 bg-white transition-colors open:bg-zinc-50/50"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-sm font-medium text-zinc-900 marker:hidden">
              <span>{faq.q}</span>
              <svg
                className="h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="border-t border-zinc-100 px-4 py-3 text-sm leading-relaxed text-zinc-600">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}