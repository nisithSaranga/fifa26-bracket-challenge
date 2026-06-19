"use client";

import { useEffect, useState } from "react";

/**
 * Live ticking countdown to a kickoff time.
 *
 * To avoid hydration mismatch, we render a neutral placeholder on the
 * server and first client paint (so both match), then start the live
 * ticking only AFTER mount — purely in the browser, where the clock lives.
 */
export default function Countdown({ target }: { target: string }) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true);
      setNow(Date.now());
    });
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  // Server & first paint: a static placeholder so HTML matches exactly.
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 font-display font-black">
        {["H", "M", "S"].map((label) => (
          <div key={label} className="text-center">
            <div className="bg-panel-raised border border-line px-3 py-2 text-2xl text-volt tabular-nums">
              --
            </div>
            <span className="text-ink-dim text-[10px] tracking-widest font-body">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  const diff = Math.max(0, new Date(target).getTime() - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);

  return (
    <div className="flex items-center gap-2 font-display font-black">
      {[["H", h], ["M", m], ["S", s]].map(([label, val]) => (
        <div key={label as string} className="text-center">
          <div className="bg-panel-raised border border-line px-3 py-2 text-2xl text-volt tabular-nums">
            {pad(val as number)}
          </div>
          <span className="text-ink-dim text-[10px] tracking-widest font-body">{label}</span>
        </div>
      ))}
    </div>
  );
}