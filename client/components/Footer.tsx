"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line mt-10 bg-pitch/60">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="font-display font-black text-lg tracking-tight">
              FIFA<span className="text-gradient-volt">26</span> BRACKET CHALLENGE
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 font-body text-sm">
            <Link href="/" className="text-ink-dim hover:text-volt-bright transition-colors">Home</Link>
            <Link href="/leaderboard" className="text-ink-dim hover:text-volt-bright transition-colors">Leaderboard</Link>
            <Link href="/my-predictions" className="text-ink-dim hover:text-volt-bright transition-colors">My Picks</Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-ink-dim hover:text-volt-bright transition-colors"
            >
              Back to top ↑
            </button>
          </nav>
        </div>

        <div className="border-t border-line mt-5 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-ink-dim text-xs font-body">
            © {year} Nisith Saranga. All rights reserved.
          </p>
          <p className="text-ink-dim text-xs font-body">
            Not affiliated with FIFA. A fan-made project.
          </p>
        </div>
      </div>
         </footer>
  );
}