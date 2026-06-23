"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import ChampionReveal from "./ChampionReveal";

export type QualTeam = { tla: string; name: string; crest: string };

/** A qualifier tagged with where it came from (for slotting). */
type SeededTeam = QualTeam & { group: string; seed: "W" | "R" | "3"; };

/**
 * Official 2026 R32 match map (group-position based, fixed by FIFA).
 * Each slot is either a fixed winner/runner-up of a group, or a third-place
 * slot eligible from a set of groups. Source: FIFA / Wikipedia knockout bracket.
 */
type SlotSpec =
  | { kind: "W"; group: string }   // winner of group
  | { kind: "R"; group: string }   // runner-up of group
  | { kind: "3"; from: string[] }; // best third from one of these groups

const R32: { match: number; a: SlotSpec; b: SlotSpec }[] = [
  { match: 73, a: { kind: "R", group: "A" }, b: { kind: "R", group: "B" } },
  { match: 74, a: { kind: "W", group: "E" }, b: { kind: "3", from: ["A", "B", "C", "D", "F"] } },
  { match: 75, a: { kind: "W", group: "F" }, b: { kind: "R", group: "C" } },
  { match: 76, a: { kind: "W", group: "C" }, b: { kind: "R", group: "F" } },
  { match: 77, a: { kind: "W", group: "I" }, b: { kind: "3", from: ["C", "D", "F", "G", "H"] } },
  { match: 78, a: { kind: "R", group: "E" }, b: { kind: "R", group: "I" } },
  { match: 79, a: { kind: "W", group: "A" }, b: { kind: "3", from: ["C", "E", "F", "H", "I"] } },
  { match: 80, a: { kind: "W", group: "L" }, b: { kind: "3", from: ["E", "H", "I", "J", "K"] } },
  { match: 81, a: { kind: "W", group: "D" }, b: { kind: "3", from: ["B", "E", "F", "I", "J"] } },
  { match: 82, a: { kind: "W", group: "G" }, b: { kind: "3", from: ["A", "E", "H", "I", "J"] } },
  { match: 83, a: { kind: "R", group: "K" }, b: { kind: "R", group: "L" } },
  { match: 84, a: { kind: "W", group: "H" }, b: { kind: "R", group: "J" } },
  { match: 85, a: { kind: "W", group: "B" }, b: { kind: "3", from: ["E", "F", "G", "I", "J"] } },
  { match: 86, a: { kind: "W", group: "J" }, b: { kind: "R", group: "H" } },
  { match: 87, a: { kind: "W", group: "K" }, b: { kind: "3", from: ["D", "E", "I", "J", "L"] } },
  { match: 88, a: { kind: "R", group: "D" }, b: { kind: "R", group: "G" } },
];

// Fixed onward flow: each match = winners of two earlier matches.
const R16: [number, number, number][] = [
  [89, 74, 77], [90, 73, 75], [91, 76, 78], [92, 79, 80],
  [93, 83, 84], [94, 81, 82], [95, 86, 88], [96, 85, 87],
];
const QF: [number, number, number][] = [
  [97, 89, 90], [98, 93, 94], [99, 91, 92], [100, 95, 96],
];
const SF: [number, number, number][] = [
  [101, 97, 98], [102, 99, 100],
];

export default function KnockoutBracket({
  winners,
  runnersUp,
  thirds,
}: {
  winners: SeededTeam[];
  runnersUp: SeededTeam[];
  thirds: SeededTeam[]; // the 8 chosen thirds, tagged with their group
}) {

  // Resolve the 16 R32 matchups from the official map + the user's picks.
  // Uses bipartite matching so every chosen third lands in a slot where its
  // group is eligible — which guarantees no team faces its own group.
  const r32Teams = useMemo(() => {
    const byGroupW = new Map(winners.map((t) => [t.group, t]));
    const byGroupR = new Map(runnersUp.map((t) => [t.group, t]));

    const thirdSlots = R32
      .map((m, i) => {
        const spec = m.a.kind === "3" ? m.a : m.b.kind === "3" ? m.b : null;
        return spec ? { i, from: spec.from } : null;
      })
      .filter((s): s is { i: number; from: string[] } => s !== null);

    const slotToThird: number[] = new Array(thirdSlots.length).fill(-1);
    const thirdToSlot: number[] = new Array(thirds.length).fill(-1);

    function tryAssign(slotIdx: number, visited: boolean[]): boolean {
      for (let t = 0; t < thirds.length; t++) {
        if (visited[t]) continue;
        if (!thirdSlots[slotIdx].from.includes(thirds[t].group)) continue;
        visited[t] = true;
        if (thirdToSlot[t] === -1 || tryAssign(thirdToSlot[t], visited)) {
          slotToThird[slotIdx] = t;
          thirdToSlot[t] = slotIdx;
          return true;
        }
      }
      return false;
    }
    for (let s = 0; s < thirdSlots.length; s++) {
      tryAssign(s, new Array(thirds.length).fill(false));
    }

    const thirdForIndex = new Map<number, SeededTeam>();
    thirdSlots.forEach((slot, sIdx) => {
      const tIdx = slotToThird[sIdx];
      if (tIdx !== -1) thirdForIndex.set(slot.i, thirds[tIdx]);
    });
    const usedThirds = new Set(slotToThird.filter((x) => x !== -1));
    const leftover = thirds.filter((_, i) => !usedThirds.has(i));
    thirdSlots.forEach((slot) => {
      if (!thirdForIndex.has(slot.i) && leftover.length) {
        thirdForIndex.set(slot.i, leftover.shift()!);
      }
    });

    function resolve(slot: SlotSpec, matchIndex: number): SeededTeam {
      if (slot.kind === "W") return byGroupW.get(slot.group)!;
      if (slot.kind === "R") return byGroupR.get(slot.group)!;
      return thirdForIndex.get(matchIndex)!;
    }

    return R32.map((m, idx) => ({
      match: m.match,
      a: resolve(m.a, idx),
      b: resolve(m.b, idx),
    }));
  }, [winners, runnersUp, thirds]);

  // picks[matchNumber] = winning team's tla
  const [picks, setPicks] = useState<Record<number, string>>({});

  // Resolve a match's two competitors given current picks.
  function teamsFor(matchNo: number): [QualTeam, QualTeam] | null {
    const r = r32Teams.find((m) => m.match === matchNo);
    if (r) return [r.a, r.b];

    // Third-place playoff = the two semi-final LOSERS.
    if (matchNo === 103) {
      const l1 = loserOf(101), l2 = loserOf(102);
      return l1 && l2 ? [l1, l2] : null;
    }
    // Final = the two semi-final WINNERS.
    if (matchNo === 104) {
      const w1 = winnerOf(101), w2 = winnerOf(102);
      return w1 && w2 ? [w1, w2] : null;
    }

    const link = [...R16, ...QF, ...SF].find((l) => l[0] === matchNo);
    if (!link) return null;
    const [, m1, m2] = link;
    const w1 = winnerOf(m1), w2 = winnerOf(m2);
    if (!w1 || !w2) return null;
    return [w1, w2];
  }

  function winnerOf(matchNo: number): QualTeam | null {
    const pick = picks[matchNo];
    if (!pick) return null;
    const teams = teamsFor(matchNo);
    if (!teams) return null;
    return teams.find((t) => t.tla === pick) ?? null;
  }
  function loserOf(matchNo: number): QualTeam | null {
    const pick = picks[matchNo];
    const teams = teamsFor(matchNo);
    if (!pick || !teams) return null;
    return teams.find((t) => t.tla !== pick) ?? null;
  }

  // Which round are we showing? Advance once every match in a round is picked.
  const rounds: { name: string; matches: number[] }[] = [
    { name: "Round of 32", matches: R32.map((m) => m.match) },
    { name: "Round of 16", matches: R16.map((l) => l[0]) },
    { name: "Quarter-finals", matches: QF.map((l) => l[0]) },
    { name: "Semi-finals", matches: SF.map((l) => l[0]) },
  ];

  const currentRoundIndex = rounds.findIndex(
    (r) => !r.matches.every((m) => picks[m])
  );
  const inFinals = currentRoundIndex === -1; // all SF picked

  const champion = picks[104] ? winnerOf(104) : null;
  const thirdWinner = picks[103] ? winnerOf(103) : null;

  function pick(matchNo: number, tla: string) {
    setPicks((p) => {
      const next = { ...p, [matchNo]: tla };
      // Clear downstream picks that depended on this match (so changing a
      // pick doesn't leave stale winners deeper in the tree).
      const downstream = [...R16, ...QF, ...SF, [104, 101, 102], [103, 101, 102]]
        .filter((l) => l[1] === matchNo || l[2] === matchNo)
        .map((l) => l[0]);
      downstream.forEach((d) => delete next[d]);
      return next;
    });
  }

// ---- CHAMPION REVEAL ----
  if (champion) {
    const runnerUp = loserOf(104);

    // Each QF tie → {winner, loser}; SF winner is the side's finalist.
    const tie = (matchNo: number) => {
      const w = winnerOf(matchNo), l = loserOf(matchNo);
      return w && l ? { winner: w, loser: l } : null;
    };

    // Left half feeds SF 101 (from QF 97, 98); right half feeds SF 102 (QF 99, 100).
    const poster = {
      left: {
        qf: [tie(97), tie(98)],
        sf: tie(101),
        finalist: winnerOf(101),
      },
      right: {
        qf: [tie(99), tie(100)],
        sf: tie(102),
        finalist: winnerOf(102),
      },
    };

    return (
      <ChampionReveal
        champion={champion}
        runnerUp={runnerUp}
        thirdWinner={thirdWinner}
        poster={poster}
        onReset={() => setPicks({})}
      />
    );
  }
  // ---- FINALS PHASE: third-place playoff FIRST, then the final ----
  if (inFinals) {
    const thirdTeams = teamsFor(103);
    const finalTeams = teamsFor(104);
    const thirdDone = !!picks[103];

    // Step A: third-place playoff (must be picked before the final shows).
    if (!thirdDone) {
      return (
        <div className="card-angled panel-gradient border border-line p-6 max-w-xl mx-auto">
          <p className="text-ink-dim text-[11px] tracking-[0.3em] font-display font-bold uppercase mb-2 text-center">
            Third-Place Playoff
          </p>
          <p className="text-ink-dim text-xs font-body text-center mb-5">
            The two semi-final losers meet for third place. Pick the winner.
          </p>
          {thirdTeams && (
            <Matchup pair={thirdTeams} picked={null} onPick={(t) => pick(103, t)} />
          )}
        </div>
      );
    }

    // Step B: the final (third place already decided).
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="card-angled panel-hero border border-line p-6">
          <p className="text-gradient-volt text-xs tracking-[0.4em] font-display font-bold uppercase mb-2 text-center">
            The Final
          </p>
          <p className="text-ink-dim text-xs font-body text-center mb-5">
            MetLife Stadium · Tap your World Cup champion.
          </p>
          {finalTeams && (
            <Matchup pair={finalTeams} picked={picks[104] ?? null} onPick={(t) => pick(104, t)} />
          )}
        </div>
        <div className="text-center">
          <button
            onClick={() => setPicks((p) => { const n = { ...p }; delete n[103]; delete n[104]; return n; })}
            className="text-ink-dim hover:text-volt-bright transition-colors font-body text-xs"
          >
            ← Re-pick third place
          </button>
        </div>
      </div>
    );
  }

  // ---- ROUNDS PHASE ----
  const round = rounds[currentRoundIndex];
  const pickedCount = round.matches.filter((m) => picks[m]).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-lg tracking-wide accent-line">{round.name}</h2>
        <span className="text-ink-dim text-xs font-body">
          {pickedCount} / {round.matches.length} picked
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {round.matches.map((matchNo) => {
          const teams = teamsFor(matchNo);
          if (!teams) return null;
          return (
            <div key={matchNo} className="card-angled panel-gradient border border-line p-4">
              <Matchup pair={teams} picked={picks[matchNo] ?? null} onPick={(t) => pick(matchNo, t)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Matchup({
  pair,
  picked,
  onPick,
}: {
  pair: [QualTeam, QualTeam];
  picked: string | null;
  onPick: (tla: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {pair.map((team) => {
        const isPicked = picked === team.tla;
        const isBeaten = picked != null && !isPicked;
        return (
          <motion.button
            key={team.tla}
            onClick={() => onPick(team.tla)}
            animate={{ opacity: isBeaten ? 0.35 : 1, scale: isPicked ? 1.04 : 1 }}
            transition={{ duration: 0.25 }}
            className={`flex-1 flex items-center gap-2 px-3 py-3 rounded-md border transition-colors
              ${isPicked ? "bg-volt/15 border-volt glow-gold" : "bg-panel border-line hover:border-volt-bright"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={team.crest} alt="" className="h-6 w-6 object-contain" />
            <span className="font-display font-bold text-sm">{team.tla}</span>
          </motion.button>
        );
      })}
    </div>
  );
}