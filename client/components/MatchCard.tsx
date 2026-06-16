"use client";

import { useState } from "react";
import type { Match } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import PredictionForm from "./PredictionForm";
import Link from "next/link";

export default function MatchCard({ match }: { match: Match }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const kickoff = new Date(match.kickoff);
  const locked = Date.now() >= kickoff.getTime(); // UI hint only — server is the real lock
  const predictable = !locked && !isLive && !isFinished;

  return (
    <div className="card-angled bg-panel border border-line p-5 transition-colors">
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
              {kickoff.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Colombo",
              })}
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
        {isFinished && <span className="text-ink-dim text-xs tracking-widest font-body">FULL TIME</span>}
        {predictable && (
          <span className="text-ink-dim text-xs tracking-widest font-body">
            {kickoff.toLocaleDateString("en-GB", {
              weekday: "short",
              month: "short",
              day: "numeric",
              timeZone: "Asia/Colombo",
            })}
          </span>
        )}
        {locked && !isLive && !isFinished && (
          <span className="text-ink-dim text-xs tracking-widest font-body">LOCKED</span>
        )}
      </div>

      {/* Prediction area — only for predictable matches */}
      {predictable && (
        <div className="mt-4">
          {!user ? (
            <Link
              href="/login"
              className="block text-center text-gold text-xs font-body tracking-wide hover:underline"
            >
              Sign in to predict →
            </Link>
          ) : !open ? (
            <button
              onClick={() => setOpen(true)}
              className="w-full border border-gold text-gold font-display font-bold text-sm tracking-wide py-2 hover:bg-gold hover:text-pitch transition-colors"
            >
              PREDICT
            </button>
          ) : (
            <PredictionForm
              matchId={match._id}
              homeTla={match.homeTeam.tla || match.homeTeam.shortName}
              awayTla={match.awayTeam.tla || match.awayTeam.shortName}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TeamSide({ team, right = false }: { team: Match["homeTeam"]; right?: boolean }) {
  return (
    <div className={`flex items-center gap-3 flex-1 ${right ? "flex-row-reverse" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={team.crest} alt={team.name} className="h-9 w-9 object-contain" />
      <span className="font-display font-bold text-lg leading-tight">
        {team.tla || team.shortName}
      </span>
    </div>
  );
}