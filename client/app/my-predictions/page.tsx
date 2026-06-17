"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface PopulatedPrediction {
  _id: string;
  predictedHome: number;
  predictedAway: number;
  pointsAwarded: number | null;
  match: {
    _id: string;
    homeTeam: { tla: string; shortName: string; crest: string };
    awayTeam: { tla: string; shortName: string; crest: string };
    kickoff: string;
    status: string;
    score: { home: number | null; away: number | null };
    stage: string;
    group: string | null;
  } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function MyPredictionsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [predictions, setPredictions] = useState<PopulatedPrediction[]>([]);
  const [fetching, setFetching] = useState(true);

  // Redirect to login if not authenticated (once auth state resolves)
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/predictions/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setPredictions(data.predictions ?? []);
      } catch {
        /* leave empty on error */
      } finally {
        setFetching(false);
      }
    })();
  }, [token]);

  if (loading || fetching) {
    return <main className="max-w-3xl mx-auto px-6 py-14 text-ink-dim font-body">Loading your predictions…</main>;
  }

  const totalPoints = predictions.reduce((sum, p) => sum + (p.pointsAwarded ?? 0), 0);

  return (
    <main className="max-w-3xl mx-auto px-6 py-14">
      <header className="mb-10">
        <h1 className="font-display font-black text-4xl tracking-tight">
          MY <span className="text-gold">PREDICTIONS</span>
        </h1>
        <p className="text-ink-dim font-body mt-2">
          {predictions.length} predictions ·{" "}
          <span className="text-gold font-display font-bold">{totalPoints} pts</span> earned
        </p>
      </header>

      {predictions.length === 0 ? (
        <p className="text-ink-dim font-body">
          No predictions yet. Head to the home page and make your picks.
        </p>
      ) : (
        <div className="space-y-3">
          {predictions.map((p) => (
            <PredictionRow key={p._id} p={p} />
          ))}
        </div>
      )}
    </main>
  );
}

function PredictionRow({ p }: { p: PopulatedPrediction }) {
  if (!p.match) return null;
  const m = p.match;
  const finished = m.status === "FINISHED";

  // Color the points badge by outcome
  const pts = p.pointsAwarded;
  const badge =
    pts === 3 ? "text-live" : pts === 1 ? "text-gold" : pts === 0 ? "text-ink-dim" : "text-ink-dim";

  return (
    <div className="card-angled bg-panel border border-line px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={m.homeTeam.crest} alt="" className="h-6 w-6 object-contain" />
        <span className="font-display font-bold">{m.homeTeam.tla || m.homeTeam.shortName}</span>
        <span className="text-ink-dim font-display text-sm">vs</span>
        <span className="font-display font-bold">{m.awayTeam.tla || m.awayTeam.shortName}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={m.awayTeam.crest} alt="" className="h-6 w-6 object-contain" />
      </div>

      <div className="text-center">
        <p className="text-ink-dim text-[10px] tracking-widest font-body">YOUR PICK</p>
        <p className="font-display font-black text-lg">
          {p.predictedHome} — {p.predictedAway}
        </p>
      </div>

      <div className="text-center min-w-[70px]">
        {finished ? (
          <>
            <p className="text-ink-dim text-[10px] tracking-widest font-body">RESULT</p>
            <p className="font-display font-bold text-gold">
              {m.score.home} — {m.score.away}
            </p>
          </>
        ) : (
          <p className="text-ink-dim text-xs font-body">pending</p>
        )}
      </div>

      <div className="text-center min-w-[50px]">
        {pts != null ? (
          <span className={`font-display font-black text-xl ${badge}`}>+{pts}</span>
        ) : (
          <span className="text-ink-dim text-xs font-body">—</span>
        )}
      </div>
    </div>
  );
}