import type { Match } from "@/lib/api";

/**
 * The product's signature unit: one match in an angled card.
 * Crests come from football-data.org URLs already in our database.
 */
export default function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const kickoff = new Date(match.kickoff);

  return (
    <div className="card-angled bg-panel border border-line p-5 hover:bg-panel-raised transition-colors">
      {/* stage / group label */}
      <p className="text-ink-dim text-[11px] tracking-[0.25em] uppercase font-body mb-4 text-center">
        {match.group ? match.group.replace("_", " ") : match.stage.replace(/_/g, " ")}
      </p>

      <div className="flex items-center justify-between gap-3">
        <TeamSide team={match.homeTeam} />

        <div className="text-center min-w-[90px]">
          {isLive || isFinished ? (
            <span className="font-display font-black text-3xl text-gold">
              {match.score.home} — {match.score.away}
            </span>
          ) : (
            <span className="font-display font-bold text-xl text-ink-dim">
              {kickoff.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        <TeamSide team={match.awayTeam} right />
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 h-4">
        {isLive && (
          <>
            <span className="h-2 w-2 rounded-full bg-live animate-pulse" />
            <span className="text-live text-xs tracking-widest font-body">
              LIVE{match.minute != null ? ` — ${match.minute}'` : ""}
            </span>
          </>
        )}
        {isFinished && (
          <span className="text-ink-dim text-xs tracking-widest font-body">FULL TIME</span>
        )}
        {!isLive && !isFinished && (
          <span className="text-ink-dim text-xs tracking-widest font-body">
            {kickoff.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
}

function TeamSide({ team, right = false }: { team: Match["homeTeam"]; right?: boolean }) {
  return (
    <div className={`flex items-center gap-3 flex-1 ${right ? "flex-row-reverse" : ""}`}>
      {/* crest URLs are external — plain img keeps it simple for now */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={team.crest} alt={team.name} className="h-9 w-9 object-contain" />
      <span className="font-display font-bold text-lg leading-tight">
        {team.tla || team.shortName}
      </span>
    </div>
  );
}