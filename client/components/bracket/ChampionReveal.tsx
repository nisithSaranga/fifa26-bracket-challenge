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

// Gold & Midnight palette (poster card only).
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

// Result-screen palette.
const E = {
  bg1: "#02102d",
  bg2: "#020819",
  border: "rgba(90,140,255,.35)",
  emerald: "#4a8cff",
  emeraldBright: "#7dc2ff",
  label: "#8db4ff",
  deep: "#081b44",
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
  const [shareOpen, setShareOpen] = useState(false);

  const siteUrl = "https://fifa26-bracket-challenge.vercel.app";

  const shareSummary =
    `🏆 ${who}'s 2026 World Cup prediction\n` +
    `Champion: ${champion.name}\n` +
    (runnerUp ? `Runner-up: ${runnerUp.name}\n` : "") +
    (thirdWinner ? `Third: ${thirdWinner.name}\n` : "") +
    `\nMake yours: ${siteUrl}`;

  async function downloadImage() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: C.bg, skipFonts: true });
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

  // Mobile: shares the actual PNG file + the link via the native sheet
  // (user picks WhatsApp → chat or Status). Desktop: downloads as a fallback.
  async function shareImage() {
    setShareOpen(false);
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: C.bg,
        skipFonts: true,
      });
      if (!blob) throw new Error("no blob");
      const file = new File([blob], "worldcup-2026-prediction.png", { type: "image/png" });

      const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        // Phone: shares image + text/link together → user picks WhatsApp.
        await navigator.share({
          files: [file],
          title: "My World Cup 2026 prediction",
          text: shareSummary,
        });
      } else {
        // Desktop: can't push files to apps — download instead.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "worldcup-2026-prediction.png";
        a.click();
        URL.revokeObjectURL(url);
        alert("Image downloaded. On a phone you can share it straight to WhatsApp.");
      }
    } catch (err) {
      console.error("Image share failed:", err);
    } finally {
      setBusy(false);
    }
  }

  async function copyTextShare() {
    setShareOpen(false);
    try {
      await navigator.clipboard.writeText(shareSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy failed — you can screenshot the card instead.");
    }
  }

  return (
    <div className="space-y-6">
      {!showCard ? (
        // ===== Emerald simple-result screen =====
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            background: `radial-gradient(circle at 50% 0%, rgba(40,120,255,.22), transparent 45%), linear-gradient(180deg, ${E.bg1} 0%, ${E.bg2} 60%, #000611 100%)`,
            border: `1px solid ${E.border}`,
            boxShadow: "0 0 60px rgba(70,130,255,.12), inset 0 0 40px rgba(40,100,255,.08)",
          }}
          className="rounded-2xl p-6 text-center relative overflow-hidden max-w-lg mx-auto"
        >
          <Fireworks colors={[E.emerald, E.emeraldBright, "#a7f3d0", "#10b981"]} />

          <div className="relative z-10 flex flex-col items-center">
           <div className="relative flex items-center justify-center">
              <div
                className="absolute"
                style={{
                  width: 220, height: 180,
                  background: "radial-gradient(ellipse at center, rgba(80,150,255,.35) 0%, rgba(40,100,255,.12) 40%, transparent 70%)",
                  filter: "blur(4px)",
                }}
              />
              <img src="/trophy.png" alt="Trophy" className="h-20 w-auto object-contain relative z-10" />
            </div>
            {/* Big champion flag */}
            <motion.img
              src={proxiedCrest(champion.crest)}
              alt={champion.name}
              crossOrigin="anonymous"
              className="h-16 w-16 object-contain mt-3 mb-2"
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />

            <p style={{ color: E.label }} className="text-xs tracking-[0.4em] font-display font-bold uppercase mb-2">
              Your Champion
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
              <span
                style={{
                  background: "linear-gradient(90deg, #ffffff 0%, #7bbdff 45%, #4f8fff 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {champion.name.toUpperCase()}
              </span>
            </h2>
            <p className="text-ink font-body text-sm mt-2">
              {who} predicts {champion.name} to win the 2026 World Cup 🏆
            </p>

            <div className="flex items-center justify-center gap-10 mt-6 pt-5 border-t" style={{ borderColor: E.border }}>
              {runnerUp && <ResultMini label="Runner-up" team={runnerUp} />}
              {thirdWinner && <ResultMini label="Third place" team={thirdWinner} />}
            </div>

            <div className="flex flex-col items-center gap-3 mt-8">
              <button
                onClick={() => setShowCard(true)}
                style={{ background: `linear-gradient(135deg, ${E.emerald}, ${E.emeraldBright})`, color: E.deep }}
                className="font-display font-bold tracking-wide px-8 py-3 rounded-md"
              >
                🎉 CREATE SHAREABLE CARD
              </button>
              <button
                onClick={onReset}
                className="text-ink-dim hover:text-volt-bright transition-colors font-body text-sm"
              >
                ↺ Start over
              </button>
            </div>
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

            <div className="relative">
              <button
                onClick={() => setShareOpen((o) => !o)}
                disabled={busy}
                className="btn-cyan text-white font-display font-bold tracking-wide px-6 py-3 rounded-md disabled:opacity-50"
              >
                {copied ? "COPIED ✓" : busy ? "Preparing…" : "↗ SHARE"}
              </button>

              {shareOpen && (
                <>
                  {/* click-away backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setShareOpen(false)} />
                  <div className="absolute z-50 mt-2 left-1/2 -translate-x-1/2 w-52 rounded-lg border border-line bg-panel-raised shadow-xl overflow-hidden">
                    <ShareItem label="Share image (WhatsApp…)" icon="📲" onClick={shareImage} />
                    <ShareItem label="Copy text + link" icon="📋" onClick={copyTextShare} />
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setShowCard(false)} className="text-ink-dim hover:text-volt-bright transition-colors font-body text-sm px-4 py-2">
              ← Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** A row in the share popup. */
function ShareItem({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-body text-ink hover:bg-volt/10 transition-colors"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
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

/** Gold trophy on the poster — your /public image. */
function GoldTrophy() {
  return (
    <motion.img
      src="/trophy.png"
      alt="Trophy"
      className="h-16 w-auto object-contain mx-auto"
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
    />
  );
}

/** Runner-up / third-place mini block on the emerald result screen. */
function ResultMini({ label, team }: { label: string; team: QualTeam }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={proxiedCrest(team.crest)} alt="" crossOrigin="anonymous" className="h-8 w-8 object-contain" />
      <span style={{ color: E.label }} className="text-[10px] font-body uppercase tracking-wider">{label}</span>
      <span className="font-display font-bold text-sm text-ink">{team.tla}</span>
    </div>
  );
}

/** Firework bursts; accepts a color set so it can match each screen. */
function Fireworks({ colors }: { colors: string[] }) {
  const bursts = [
    { x: "15%", y: "12%", delay: 0 },
    { x: "82%", y: "18%", delay: 0.4 },
    { x: "50%", y: "6%", delay: 0.8 },
    { x: "28%", y: "22%", delay: 1.1 },
    { x: "70%", y: "10%", delay: 1.5 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none">
      {bursts.map((b, bi) => (
        <div key={bi} className="absolute" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                className="absolute block h-1 w-1 rounded-full"
                style={{ backgroundColor: colors[(bi + i) % colors.length] }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: Math.cos(angle) * 34, y: Math.sin(angle) * 34, opacity: 0 }}
                transition={{ duration: 1.1, delay: b.delay, repeat: Infinity, repeatDelay: 1.6, ease: "easeOut" }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}