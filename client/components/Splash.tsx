"use client";

import { useState, useEffect } from "react";
import { useAudio } from "@/lib/audio-context";

/**
 * Cinematic intro. Shows on a fresh visit; hidden once the user has
 * entered this browser session (so it doesn't re-trigger on navigation).
 */
export default function Splash() {
  const { start } = useAudio();
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false); // visible by default

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (sessionStorage.getItem("fifa26_entered")) {
        setGone(true); // already entered this session -> skip splash
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  function enter() {
    start();
    sessionStorage.setItem("fifa26_entered", "1");
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
        <span className="text-ink">FIFA 2026</span>
        <br />
        <span className="text-gradient-volt">BRACKET CHALLENGE</span>
      </h1>

      <button
        onClick={enter}
        className="mt-12 btn-volt text-white font-display font-bold text-lg tracking-[0.2em] px-10 py-4 rounded-md"
      >
        ENTER STADIUM
      </button>
    </div>
  );
}