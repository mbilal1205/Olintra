"use client";

/**
 * ================================================================
 * Olintra — AdSlot
 * ================================================================
 * CLS-safe ad container. Dev mein placeholder, prod mein AdSense.
 *
 * Env var required for live ads:
 *   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *
 * AdSense policies followed:
 *   - "Advertisement" label
 *   - Reserved min-height (no layout shift)
 *   - aria-hidden (decorative for screen readers)
 * ================================================================
 */

import { useEffect, useRef } from "react";

type AdSlotProps = {
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  minHeight?: number;
  className?: string;
  label?: boolean;
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const IS_DEV = process.env.NODE_ENV === "development";

export function AdSlot({
  slotId,
  format = "auto",
  minHeight = 90,
  className = "",
  label = true,
}: AdSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (IS_DEV || !ADSENSE_CLIENT || !slotId || pushed.current) return;
    try {
      // @ts-expect-error — adsbygoogle injected by AdSense script in layout
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Silent — AdSense script not loaded yet or blocked
    }
  }, [slotId]);

  const showPlaceholder = IS_DEV || !ADSENSE_CLIENT || !slotId;

  return (
    <div className={className}>
      {label && (
        <p className="mb-1.5 text-center text-[10px] font-medium uppercase tracking-widest text-zinc-400">
          Advertisement
        </p>
      )}

      {showPlaceholder ? (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 text-xs text-zinc-400"
          style={{ minHeight }}
          aria-hidden="true"
        >
          <span className="px-3 text-center">
            Ad space · {format} · reserved {minHeight}px
          </span>
        </div>
      ) : (
        <ins
          className="adsbygoogle block"
          style={{ display: "block", minHeight }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}