type HowToStep = { name: string; text: string };

export function ToolHowTo({
  steps,
  title = "How to use this tool",
}: {
  steps: HowToStep[];
  title?: string;
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
        {title}
      </h2>
      <ol className="mt-6 space-y-3">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex gap-4 rounded-lg border border-zinc-100 bg-white p-4"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
              {i + 1}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                {step.name}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}