import Link from "next/link";
import { getLiveMatches, getUpcomingMatches, getFinishedMatches, safe } from "@/lib/api";import MatchCard from "@/components/MatchCard";
import Countdown from "@/components/Countdown";
import StandingsAside from "@/components/StandingsAside";
import StatCounter from "@/components/StatCounter";
import HomeReveal from "@/components/HomeReveal";
import Splash from "@/components/Splash";

export default async function Home() {
  const [liveRes, upcomingRes, finishedRes] = await Promise.all([
    safe(getLiveMatches(), { matches: [] }),
    safe(getUpcomingMatches(), { matches: [] }),
    safe(getFinishedMatches(), { count: 0, matches: [] }),
  ]);

  const live = liveRes.matches ?? [];
  const upcoming = upcomingRes.matches ?? [];
  const finished = finishedRes.matches ?? [];
  const featured = live[0] ?? upcoming[0] ?? null;
  const isFeaturedLive = live.length > 0;
  const totalGoals = finished.reduce(
    (sum, m) => sum + (m.score.home ?? 0) + (m.score.away ?? 0),
    0
  );
  
  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <Splash/>
      <HomeReveal>
        {/* ===== SLIM TITLE BANNER ===== */}
        <section className="card-angled panel-hero border border-line px-8 py-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-ink-dim tracking-[0.35em] text-[11px] font-body uppercase">
              June 11 — July 19, 2026
            </p>
            <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight leading-none mt-1">
              <span className="text-sweep">FIFA 2026</span>{" "}
              <span className="text-ink">BRACKET CHALLENGE</span>
            </h1>
          </div>
          <Link
            href="#upcoming"
            className="btn-volt text-white font-display font-bold text-sm tracking-wide px-6 py-3 rounded-md self-start sm:self-auto"
          >
            START PREDICTING
          </Link>
        </section>

        {/* ===== HERO: featured match + standings ===== */}
        <section className="grid lg:grid-cols-[1.6fr_1fr] gap-6 mb-8">
          <div className="card-angled panel-gradient card-hover border border-line p-8 flex flex-col justify-center">
            {featured ? (
              <>
               <p className="text-gradient-volt text-xs tracking-[0.3em] font-display font-bold uppercase mb-3 text-center">
                  2026 Football World Cup
                </p>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-ink-dim text-[11px] tracking-widest font-body uppercase">
                    {isFeaturedLive ? "Live right now" : "Next kickoff"}
                  </span>
                  <span className="text-ink-dim text-[11px] tracking-widest font-body uppercase">
                    {featured.group ? featured.group.replace("_", " ") : featured.stage.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={featured.homeTeam.crest} alt="" className="h-14 w-14 object-contain" />
                    <span className="font-display font-black text-xl">{featured.homeTeam.tla}</span>
                  </div>

                  <div className="text-center">
                    {isFeaturedLive ? (
                      <span className="font-display font-black text-5xl text-gradient-volt">
                        {featured.score.home} : {featured.score.away}
                      </span>
                    ) : (
                      <Countdown target={featured.kickoff} />
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={featured.awayTeam.crest} alt="" className="h-14 w-14 object-contain" />
                    <span className="font-display font-black text-xl">{featured.awayTeam.tla}</span>
                  </div>
                </div>

                {isFeaturedLive && (
                  <div className="flex items-center justify-center gap-2 mt-5">
                    <span className="h-2.5 w-2.5 rounded-full bg-live live-pulse" />
                    <span className="text-live text-xs tracking-widest font-body">
                      LIVE{featured.minute != null ? ` — ${featured.minute}'` : ""}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-ink-dim font-body text-center">No matches scheduled right now.</p>
            )}
          </div>

          <StandingsAside />
        </section>

        {/* ===== STATS STRIP ===== */}
        <section className="card-angled panel-gradient border border-line py-6 px-8 mb-8 grid grid-cols-3 gap-4">
          <StatCounter value={finished.length} label="Matches played" variant="volt" />
          <StatCounter value={totalGoals} label="Goals scored" variant="cyan" />
          <StatCounter value={live.length} label="Live now" variant="indigo" />
        </section>

        {/* ===== NAV TILES ===== */}
        <section className="grid sm:grid-cols-3 gap-4 mb-10">
          <NavTile href="#upcoming" title="PREDICT" desc="Call the scores before kickoff" cls="btn-volt" />
          <NavTile href="/my-predictions" title="MY PICKS" desc="Track your points & history" cls="btn-cyan" />
          <NavTile href="/leaderboard" title="LEADERBOARD" desc="See where you rank" cls="btn-volt" />
        </section>

        {/* ===== UPCOMING ===== */}
        <section id="upcoming">
          <h2 className="font-display font-bold text-xl tracking-wide mb-5 accent-line">
            UPCOMING <span className="text-gradient-volt">MATCHES</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => <MatchCard key={m._id} match={m} />)}
          </div>
        </section>
      </HomeReveal>
    </main>
  );
}

function NavTile({ href, title, desc, cls }: { href: string; title: string; desc: string; cls: string }) {
  return (
    <Link href={href} className={`card-angled border border-line p-5 block ${cls}`}>
      <h3 className="font-display font-black text-lg text-white">{title}</h3>
      <p className="text-white/70 text-sm font-body mt-1">{desc}</p>
    </Link>
  );
}