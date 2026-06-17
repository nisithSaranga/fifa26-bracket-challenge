import { getLeaderboard } from "@/lib/api";

/**
 * Public leaderboard — a server component: fetches on the server,
 * ships finished HTML. Ranks come straight from the aggregation pipeline.
 */
export default async function LeaderboardPage() {
  const { leaderboard } = await getLeaderboard();

  return (
    <main className="max-w-3xl mx-auto px-6 py-14">
      <header className="mb-10">
        <h1 className="font-display font-black text-4xl tracking-tight">
          LEADER<span className="text-gold">BOARD</span>
        </h1>
        <p className="text-ink-dim font-body mt-2">Match Predictor standings · top 100</p>
      </header>

      {leaderboard.length === 0 ? (
        <p className="text-ink-dim font-body">
          No scores yet. Once matches finish and predictions are graded, rankings appear here.
        </p>
      ) : (
        <div className="space-y-2">
          {/* column header row */}
          <div className="grid grid-cols-[40px_1fr_70px_70px_60px] gap-3 px-4 text-ink-dim text-[10px] tracking-widest font-body uppercase">
            <span>#</span>
            <span>Player</span>
            <span className="text-center">Scored</span>
            <span className="text-center">Exact</span>
            <span className="text-right">Pts</span>
          </div>

          {leaderboard.map((row) => (
            <div
              key={row.rank}
              className={`card-angled border px-4 py-3 grid grid-cols-[40px_1fr_70px_70px_60px] gap-3 items-center
                ${row.rank <= 3 ? "bg-panel-raised border-gold-deep" : "bg-panel border-line"}`}
            >
              <span className={`font-display font-black text-lg ${row.rank <= 3 ? "text-gold" : "text-ink-dim"}`}>
                {row.rank}
              </span>
              <span className="font-display font-bold truncate">{row.username}</span>
              <span className="text-center font-body text-ink-dim">{row.predictionsScored}</span>
              <span className="text-center font-body text-live">{row.exactScores}</span>
              <span className="text-right font-display font-black text-xl text-gold">{row.totalPoints}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}