import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 transition-colors hover:text-zinc-700"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-sm font-bold text-white">
            O
          </span>
          <span>Olintra</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm md:gap-2">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            Tools
          </Link>
          <Link
            href="/about"
            className="rounded-md px-3 py-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}