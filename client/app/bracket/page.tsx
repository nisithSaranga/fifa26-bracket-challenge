"use client";

import { useEffect, useState } from "react";
import { getStandings, type GroupStanding, type StandingTeam } from "@/lib/api";
import GroupOrderCard from "@/components/bracket/GroupOrderCard";
import ThirdPlacePicker from "@/components/bracket/ThirdPlacePicker";
import KnockoutBracket from "@/components/bracket/KnockoutBracket";

type Stage = "groups" | "thirds" | "knockout";

export default function BracketPage() {
  const [groups, setGroups] = useState<GroupStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage>("groups");

  // The 8 third-placed teams the user selects to advance (by tla).
  const [chosenThirds, setChosenThirds] = useState<string[]>([]);

  useEffect(() => {
    getStandings()
      .then((d) => setGroups(d.standings))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  function updateGroup(groupName: string, newTeams: StandingTeam[]) {
    setGroups((prev) =>
      prev.map((g) => (g.group === groupName ? { ...g, teams: newTeams } : g))
    );
  }

  // group letter only, e.g. "GROUP_A" → "A"
  const letter = (g: string) => g.replace("GROUP_", "");

  // Derived qualifiers from the locked group order, tagged with group + seed.
  const winners = groups.map((g) => ({
    tla: g.teams[0].tla, name: g.teams[0].name, crest: g.teams[0].crest,
    group: letter(g.group), seed: "W" as const,
  }));
  const runnersUp = groups.map((g) => ({
    tla: g.teams[1].tla, name: g.teams[1].name, crest: g.teams[1].crest,
    group: letter(g.group), seed: "R" as const,
  }));
  const thirdPlaced = groups.map((g) => ({
    tla: g.teams[2].tla, name: g.teams[2].name, crest: g.teams[2].crest,
    group: letter(g.group), seed: "3" as const,
  }));

  // The 32 qualifiers (kept for compatibility; component resolves from the map).
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-[70vh]">
      <header className="mb-8">
        <p className="text-gradient-volt text-xs tracking-[0.3em] font-display font-bold uppercase mb-2">
          Tournament Predictor
        </p>
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
          {stage === "groups" && <>PREDICT THE <span className="text-gradient-volt">GROUPS</span></>}
          {stage === "thirds" && <>BEST <span className="text-gradient-volt">THIRD-PLACE</span> TEAMS</>}
          {stage === "knockout" && <>THE <span className="text-gradient-volt">KNOCKOUTS</span></>}
        </h1>
        <p className="text-ink-dim font-body mt-2 text-sm">
          {stage === "groups" && "Drag each team into the order you think the group will finish. Top 2 advance automatically."}
          {stage === "thirds" && "8 of the 12 third-placed teams also advance. Pick the 8 you think make it."}
          {stage === "knockout" && "Tap a team to send them through to the next round."}
        </p>
      </header>

      {loading ? (
        <p className="text-ink-dim font-body">Loading groups…</p>
      ) : groups.length === 0 ? (
        <p className="text-ink-dim font-body">Groups will appear once tournament data is available.</p>
      ) : stage === "groups" ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <GroupOrderCard key={g.group} group={g} onReorder={(teams) => updateGroup(g.group, teams)} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setStage("thirds")}
              className="btn-volt text-white font-display font-bold tracking-wide px-8 py-3 rounded-md"
            >
              LOCK IN GROUPS → PICK THIRD-PLACE
            </button>
          </div>
        </>
      ) : stage === "thirds" ? (
        <ThirdPlacePicker
          thirdPlaced={thirdPlaced}
          chosen={chosenThirds}
          onChange={setChosenThirds}
          onBack={() => setStage("groups")}
          onContinue={() => setStage("knockout")}
        />
      ) : (
        <KnockoutBracket
          winners={winners}
          runnersUp={runnersUp}
          thirds={thirdPlaced.filter((t) => chosenThirds.includes(t.tla))}
        />
      )}
    </main>
  );
}