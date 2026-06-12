import MatchCard from "@/components/MatchCard";
import { getLiveMatches, getUpcomingMatches } from "@/lib/api";

/**
 * Home — temporary layout, real data.
 * This is a SERVER component: it runs on the Next.js server, calls our
 * API there, and ships finished HTML to the browser.
 */
export default async function Home() {
  const [{ matches: live }, { matches: upcoming }] = await Promise.all([
    getLiveMatches(),
    getUpcomingMatches(),
  ]);

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-14">
      <header className="text-center mb-14">
        <p className="text-ink-dim tracking-[0.35em] text-xs font-body uppercase">
          June 11 — July 19, 2026
        </p>
        <h1 className="font-display font-black text-5xl tracking-tight mt-2">
          FIFA 2026 <span className="text-gold">BRACKET CHALLENGE</span>
        </h1>
      </header>

      {live.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display font-bold text-xl tracking-wide text-live mb-5">
            ● LIVE NOW
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {live.map((m) => <MatchCard key={m._id} match={m} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display font-bold text-xl tracking-wide mb-5">
          UPCOMING <span className="text-gold">MATCHES</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {upcoming.map((m) => <MatchCard key={m._id} match={m} />)}
        </div>
      </section>
    </main>
  );
}