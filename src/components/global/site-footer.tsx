"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteFooter() {
  // SSR ko khush rakhne ke liye shuru mein default "2026" text set kiya ha
  const [year, setYear] = useState<string>("2026");

  useEffect(() => {
    // Browser mein mount hote hi yeh automatically real current year le aayega
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="mt-16 border-t border-zinc-200 bg-white">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-base font-semibold text-zinc-900">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-900 text-xs font-bold text-white">
                O
              </span>
              Olintra
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-600">
              Fast, free, and private tools for developers and professionals.
              No signup, no tracking, no nonsense.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tools
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/cron-generator"
                  className="text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  Cron Expression Generator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Company
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-zinc-100 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <p>© {year} Olintra. All rights reserved.</p>
          <p>Built for the modern web.</p>
        </div>
      </div>
    </footer>
  );
}
