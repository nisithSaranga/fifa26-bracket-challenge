"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { savePrediction } from "@/lib/api";

/**
 * Inline score-picker shown inside a match card for upcoming matches.
 * Saving hits the real PUT endpoint; the server's kickoff lock is the
 * source of truth — this UI just reflects it.
 */
export default function PredictionForm({
  matchId,
  homeTla,
  awayTla,
  initialHome,
  initialAway,
}: {
  matchId: string;
  homeTla: string;
  awayTla: string;
  initialHome?: number;
  initialAway?: number;
}) {
  const { token } = useAuth();
  const [home, setHome] = useState(initialHome ?? 0);
  const [away, setAway] = useState(initialAway ?? 0);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    if (!token) return;
    setStatus("saving");
    setMessage(null);
    try {
      await savePrediction(token, matchId, home, away);
      setStatus("saved");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not save");
    }
  }

  // Saved state gets a distinct success look; otherwise the volt gradient.
  const buttonClass =
    status === "saved"
      ? "mt-3 w-full bg-live/20 border border-live text-live font-display font-bold text-sm tracking-wide py-2.5 rounded-md transition-colors"
      : "mt-3 w-full btn-volt text-white font-display font-bold text-sm tracking-wide py-2.5 rounded-md disabled:opacity-50";

  return (
    <div className="mt-4 pt-4 border-t border-line">
      <div className="flex items-center justify-center gap-3">
        <Stepper label={homeTla} value={home} onChange={setHome} />
        <span className="text-ink-dim font-display">vs</span>
        <Stepper label={awayTla} value={away} onChange={setAway} />
      </div>

      <button onClick={save} disabled={status === "saving"} className={buttonClass}>
        {status === "saving"
          ? "SAVING..."
          : status === "saved"
          ? "PREDICTION SAVED ✓"
          : "SAVE PREDICTION"}
      </button>

      {message && <p className="text-red-400 text-xs font-body mt-2 text-center">{message}</p>}
    </div>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-ink-dim text-[10px] tracking-widest font-body">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-8 w-8 border border-line text-ink-dim hover:border-volt hover:text-volt-bright hover:bg-volt/10 transition-colors font-display rounded"
        >
          −
        </button>
        <span className="font-display font-black text-2xl w-7 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(20, value + 1))}
          className="h-8 w-8 border border-line text-ink-dim hover:border-volt hover:text-volt-bright hover:bg-volt/10 transition-colors font-display rounded"
        >
          +
        </button>
      </div>
    </div>
  );
}