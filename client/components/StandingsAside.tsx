"use client";

import { useEffect, useState } from "react";
import type { GroupStanding } from "@/lib/api";
import { getStandings } from "@/lib/api";

/** Compact live group standings — shows one group at a time, cycles through. */
export default function StandingsAside() {
  const [groups, setGroups] = useState<GroupStanding[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    getStandings().then((d) => setGroups(d.standings)).catch(() => {});
  }, []);

  // Auto-rotate which group is shown every 5s
  useEffect(() => {
    if (groups.length === 0) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % groups.length), 5000);
    return () => clearInterval(id);
  }, [groups.length]);

  if (groups.length === 0) {
    return (
      <div className="card-angled panel-gradient border border-line p-5">
        <p className="text-ink-dim text-sm font-body">Standings load once matches are played.</p>
      </div>
    );
  }

  const g = groups[idx];

  return (
    <div className="card-angled panel-gradient border border-line p-4">
     <p className="text-gradient-volt text-[10px] tracking-[0.3em] font-display font-bold uppercase mb-2">
        Live Standings
      </p>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold tracking-wide accent-line">
          {g.group.replace("_", " ")}
        </h3>
        <span className="text-ink-dim text-[10px] font-body">top 2 advance</span>
      </div>
      <div className="space-y-1">
        {g.teams.map((t, i) => (
          <div
            key={t.tla}
            className={`flex items-center gap-2 text-sm py-1 ${i < 2 ? "text-ink" : "text-ink-dim"}`}
          >
            <span className="w-4 font-display font-bold text-xs">{i + 1}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.crest} alt="" className="h-4 w-4 object-contain" />
            <span className="font-display font-bold flex-1">{t.tla}</span>
            <span className="text-ink-dim text-xs tabular-nums">{t.played}P</span>
            <span className="text-ink-dim text-xs tabular-nums">{t.goalDiff >= 0 ? "+" : ""}{t.goalDiff}</span>
            <span className="font-display font-bold text-volt w-6 text-right tabular-nums">{t.points}</span>
          </div>
        ))}
      </div>
      <p className="text-ink-dim text-[10px] font-body mt-2">Top 2 advance · auto-rotating groups</p>
    </div>
  );
}