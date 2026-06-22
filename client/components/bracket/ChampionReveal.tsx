"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { useAuth } from "@/lib/auth-context";
import { proxiedCrest } from "@/lib/api";

export type QualTeam = { tla: string; name: string; crest: string };
type Tie = { winner: QualTeam; loser: QualTeam } | null;
type Side = { qf: Tie[]; sf: Tie; finalist: QualTeam | null };
export type Poster = { left: Side; right: Side };

// Gold & Midnight palette (poster-only; independent of the site's blue theme).
const C = {
  bg: "#0d0a02",
  border: "#3a2e0a",
  panel: "#14110a",
  panelWin: "#1c1605",
  borderWin: "#5c4a12",
  gold: "#d4af37",
  goldBright: "#f5d76e",
  goldText: "#f0d678",
  dim: "#6b5e3a",
  label: "#8a7a3a",
  line: "#4a3c12",
};

export default function ChampionReveal({
  champion,
  runnerUp,
  thirdWinner,
  poster,
  onReset,
}: {
  champion: QualTeam;
  runnerUp: QualTeam | null;
  thirdWinner: QualTeam | null;
  poster: Poster;
  onReset: () => void;
}) {
  const { user } = useAuth();
  const who = user?.username ?? "You";
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const siteUrl = "https://fifa26-bracket-challenge.vercel.app";

  async function downloadImage() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: C.bg });
      const link = document.createElement("a");
      link.download = `${who}-worldcup-2026-prediction.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Image export failed:", err);
      alert("Couldn't generate the image. Your text summary still works via Share.");
    } finally {
      setBusy(false);
    }
  }

  async function shareText() {
    const summary =
      `🏆 ${who}'s 2026 World Cup prediction\n` +
      `Champion: ${champion.name}\n` +
      (runnerUp ? `Runner-up: ${runnerUp.name}\n` : "") +
      (thirdWinner ? `Third: ${thirdWinner.name}\n` : "") +
      `\nMake yours: ${siteUrl}`;
    if (navigator.share) {
      try { await navigator.share({ title: "My World Cup 2026 prediction", text: summary }); return; }
      catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy failed — you can screenshot the card instead.");
    }
  }

  return (
    <div className="space-y-6">
      {!showCard ? (
        // ===== Simple result first (keeps the site's blue theme) =====
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card-angled panel-hero border border-line p-10 text-center"
        >
          <SiteTrophy />
          <p className="text-gradient-volt text-xs tracking-[0.4em] font-display font-bold uppercase mt-4 mb-2">
            Your Champion
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
            <span className="text-gradient-volt">{champion.name.toUpperCase()}</span>
          </h2>
          <p className="text-ink font-body text-sm mt-2">
            {who} predicts {champion.name} to win the 2026 World Cup 🏆
          </p>
          <div className="flex items-center justify-center gap-10 mt-6 pt-5 border-t border-line">
            {runnerUp && <SiteMini label="Runner-up" team={runnerUp} />}
            {thirdWinner && <SiteMini label="Third place" team={thirdWinner} />}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button onClick={() => setShowCard(true)} className="btn-volt text-white font-display font-bold tracking-wide px-6 py-3 rounded-md">
              🎉 CREATE SHAREABLE CARD
            </button>
            <button onClick={onReset} className="text-ink-dim hover:text-volt-bright transition-colors font-body text-sm px-4 py-2">
              ↺ Start over
            </button>
          </div>
        </motion.div>
      ) : (
        // ===== Gold & Midnight poster card =====
        <>
          <div className="overflow-x-auto">
            <div
              ref={cardRef}
              style={{ background: C.bg, border: `1px solid ${C.border}`, minWidth: 640 }}
              className="rounded-xl p-5 relative"
            >
              <p
                style={{ color: C.gold }}
                className="text-center text-[11px] tracking-[0.3em] font-display font-bold uppercase mb-5"
              >
                {who}&apos;s World Cup 2026 Prediction
              </p>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                {/* LEFT: QF (outer) → SF (inner) */}
                <div className="flex items-stretch gap-3">
                  <Column label="Quarter-finals" align="left">
                    {poster.left.qf.map((t, i) => <TieBox key={i} tie={t} align="left" />)}
                  </Column>
                  <Column label="Semi-final" align="left">
                    <TieBox tie={poster.left.sf} align="left" single />
                  </Column>
                </div>

                {/* CENTER: trophy + champion */}
                <div className="flex flex-col items-center gap-2 px-1">
                  <GoldTrophy />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proxiedCrest(champion.crest)} alt="" crossOrigin="anonymous" className="h-12 w-12 object-contain" />
                  <div
                    style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldBright})`, color: "#3a2e0a" }}
                    className="px-4 py-2 rounded-lg font-display font-black text-xl leading-none"
                  >
                    {champion.tla}
                  </div>
                  <span style={{ color: C.label }} className="text-[9px] font-body uppercase tracking-[0.2em]">
                    Champion
                  </span>
                </div>

                {/* RIGHT: SF (inner) → QF (outer), mirrored */}
                <div className="flex items-stretch gap-3 flex-row-reverse">
                  <Column label="Quarter-finals" align="right">
                    {poster.right.qf.map((t, i) => <TieBox key={i} tie={t} align="right" />)}
                  </Column>
                  <Column label="Semi-final" align="right">
                    <TieBox tie={poster.right.sf} align="right" single />
                  </Column>
                </div>
              </div>

              <p style={{ color: C.label }} className="text-center text-[9px] font-body mt-5">
                fifa26-bracket-challenge.vercel.app
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={downloadImage} disabled={busy} className="btn-volt text-white font-display font-bold tracking-wide px-6 py-3 rounded-md disabled:opacity-50">
              {busy ? "Generating…" : "⬇ DOWNLOAD IMAGE"}
            </button>
            <button onClick={shareText} className="btn-cyan text-white font-display font-bold tracking-wide px-6 py-3 rounded-md">
              {copied ? "COPIED ✓" : "↗ SHARE"}
            </button>
            <button onClick={() => setShowCard(false)} className="text-ink-dim hover:text-volt-bright transition-colors font-body text-sm px-4 py-2">
              ← Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** A labelled vertical column of ties, evenly spaced. */
function Column({
  label,
  align,
  children,
}: {
  label: string;
  align: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-center gap-4 min-w-[88px]">
      <p
        style={{ color: C.label }}
        className={`text-[9px] font-body uppercase tracking-[0.15em] ${align === "right" ? "text-right" : ""}`}
      >
        {label}
      </p>
      <div className="flex flex-col justify-around gap-4 flex-1">{children}</div>
    </div>
  );
}

/** A tie = two stacked team slots (winner gold, loser dimmed). */
function TieBox({ tie, align, single }: { tie: Tie; align: "left" | "right"; single?: boolean }) {
  if (!tie) return null;
  return (
    <div className={`flex flex-col gap-1 ${single ? "my-auto" : ""}`}>
      <TeamSlot team={tie.winner} win align={align} />
      <TeamSlot team={tie.loser} align={align} />
    </div>
  );
}

function TeamSlot({ team, win, align }: { team: QualTeam; win?: boolean; align: "left" | "right" }) {
  return (
    <div
      style={{
        background: win ? C.panelWin : C.panel,
        border: `1px solid ${win ? C.borderWin : C.border}`,
        opacity: win ? 1 : 0.55,
      }}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={proxiedCrest(team.crest)} alt="" crossOrigin="anonymous" className="h-4 w-4 object-contain shrink-0" />
      <span style={{ color: win ? C.goldText : C.dim }} className="font-display font-bold text-xs">
        {team.tla}
      </span>
    </div>
  );
}

/** Gold trophy for the poster. Swap for your own image later:
 *  return <img src="/trophy.png" alt="" className="h-14 w-auto object-contain" />; */
function GoldTrophy() {
  return (
    <motion.svg
      width="52" height="64" viewBox="0 0 64 80" className="mx-auto"
      initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
    >
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d76e" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
      </defs>
      <path d="M18 8 h28 v14 a14 14 0 0 1 -28 0 z" fill="url(#goldGrad)" />
      <path d="M18 10 h-8 a8 8 0 0 0 8 12" fill="none" stroke="url(#goldGrad)" strokeWidth="3" />
      <path d="M46 10 h8 a8 8 0 0 1 -8 12" fill="none" stroke="url(#goldGrad)" strokeWidth="3" />
      <rect x="29" y="34" width="6" height="12" fill="url(#goldGrad)" />
      <rect x="20" y="46" width="24" height="5" rx="2" fill="url(#goldGrad)" />
      <rect x="24" y="52" width="16" height="6" rx="2" fill="url(#goldGrad)" />
    </motion.svg>
  );
}

/** The simple-result trophy (site blue theme). */
function SiteTrophy() {
  return (
    <svg width="56" height="70" viewBox="0 0 64 80" className="mx-auto">
      <defs>
        <linearGradient id="siteTrophyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M18 8 h28 v14 a14 14 0 0 1 -28 0 z" fill="url(#siteTrophyGrad)" />
      <path d="M18 10 h-8 a8 8 0 0 0 8 12" fill="none" stroke="url(#siteTrophyGrad)" strokeWidth="3" />
      <path d="M46 10 h8 a8 8 0 0 1 -8 12" fill="none" stroke="url(#siteTrophyGrad)" strokeWidth="3" />
      <rect x="29" y="34" width="6" height="12" fill="url(#siteTrophyGrad)" />
      <rect x="20" y="46" width="24" height="5" rx="2" fill="url(#siteTrophyGrad)" />
      <rect x="24" y="52" width="16" height="6" rx="2" fill="url(#siteTrophyGrad)" />
    </svg>
  );
}

function SiteMini({ label, team }: { label: string; team: QualTeam }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={proxiedCrest(team.crest)} alt="" crossOrigin="anonymous" className="h-8 w-8 object-contain" />
      <span className="text-ink-dim text-[10px] font-body uppercase tracking-wider">{label}</span>
      <span className="font-display font-bold text-sm text-ink">{team.tla}</span>
    </div>
  );
}