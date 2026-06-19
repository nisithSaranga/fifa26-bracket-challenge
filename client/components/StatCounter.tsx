"use client";

import { useEffect, useState } from "react";

/** Animates a number counting up from 0 to `value` on mount. */
export default function StatCounter({
  value,
  label,
  variant = "volt",
}: {
  value: number;
  label: string;
  variant?: "volt" | "cyan" | "indigo";
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const progress = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const gradient =
    variant === "cyan"
      ? "from-cyan-300 to-cyan-600"
      : variant === "indigo"
      ? "from-indigo-300 to-indigo-600"
      : "from-blue-300 to-blue-600";

  return (
    <div className="text-center">
      <div
        className={`font-display font-black text-4xl tabular-nums bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}
      >
        {display}
      </div>
      <div className="text-ink-dim text-[10px] tracking-widest font-body uppercase mt-1">{label}</div>
    </div>
  );
}