"use client";

import { useState } from "react";
import { useAudio } from "@/lib/audio-context";

export default function Splash() {
  const { start } = useAudio();
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  function enter() {
    start();
    setLeaving(true);
    setTimeout(() => setGone(true), 700);
  }

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-pitch
                  transition-opacity duration-700 ${leaving ? "opacity-0" : "opacity-100"}`}
    >
      <p className="text-ink-dim tracking-[0.4em] text-xs font-body uppercase mb-4">
        June 11 — July 19, 2026
      </p>
      <h1 className="font-display font-black text-6xl sm:text-7xl tracking-tight text-center leading-none">
        FIFA 2026
        <br />
        <span className="text-gold">BRACKET CHALLENGE</span>
      </h1>

      <button
        onClick={enter}
        className="mt-12 border-2 border-gold text-gold font-display font-bold text-lg tracking-[0.2em]
                   px-10 py-4 hover:bg-gold hover:text-pitch transition-colors"
      >
        ENTER STADIUM
      </button>

      <p className="text-ink-dim text-[11px] font-body mt-6 tracking-wide">
        ♪ Tap to enter with sound
      </p>
    </div>
  );
}