/**
 * Fixture & result sync — football-data.org v4.
 *
 * Refactored from a one-shot script into a reusable function so the
 * cron worker can call it on a schedule. The npm script still works:
 * run directly (npm run sync), it executes once and exits.
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Match, MatchStatus } from '../models/Match';
import { env } from '../config/env';

const FD_URL = 'https://api.football-data.org/v4/competitions/WC/matches';

interface FdTeam {
  id: number | null;
  name: string | null;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

interface FdMatch {
  id: number;
  stage: string;
  group: string | null;
  matchday: number | null;
  utcDate: string;
  status: string;
  minute?: number | null;
  venue?: string | null;
  homeTeam: FdTeam;
  awayTeam: FdTeam;
  score: { fullTime: { home: number | null; away: number | null } };
}

function mapTeam(t: FdTeam) {
  return {
    fdId: t.id ?? null,
    name: t.name ?? 'To be determined',
    shortName: t.shortName ?? '',
    tla: t.tla ?? '',
    crest: t.crest ?? '',
  };
}

/**
 * Pull all WC matches and upsert into MongoDB.
 * Returns the fdMatchIds of matches whose data CHANGED —
 * the worker uses this to know what to broadcast via Socket.io.
 */
export async function syncMatches(): Promise<number[]> {
  if (!env.footballDataKey) {
    throw new Error('FOOTBALL_DATA_KEY missing in .env');
  }

  const resp = await fetch(FD_URL, {
    headers: { 'X-Auth-Token': env.footballDataKey },
  });
  if (!resp.ok) {
    throw new Error(`football-data API error ${resp.status}`);
  }

  const data = (await resp.json()) as { matches: FdMatch[] };
  const changedIds: number[] = [];

  for (const m of data.matches) {
    const update = {
      fdMatchId: m.id,
      stage: m.stage,
      group: m.group ?? null,
      matchday: m.matchday ?? null,
      kickoff: new Date(m.utcDate),
      status: m.status as MatchStatus,
      minute: m.minute ?? null,
      venue: m.venue ?? null,
      homeTeam: mapTeam(m.homeTeam),
      awayTeam: mapTeam(m.awayTeam),
      score: { home: m.score.fullTime.home, away: m.score.fullTime.away },
      lastSyncedAt: new Date(),
    };

    // Compare against what we have — only count it as changed if
    // score/status/minute actually differ (the fields users care about).
    const existing = await Match.findOne({ fdMatchId: m.id });
    const changed =
      !existing ||
      existing.status !== update.status ||
      existing.minute !== update.minute ||
      existing.score.home !== update.score.home ||
      existing.score.away !== update.score.away;

    await Match.updateOne({ fdMatchId: m.id }, { $set: update }, { upsert: true });
    if (changed) changedIds.push(m.id);
  }

  return changedIds;
}

/** Allow direct execution: npm run sync */
if (require.main === module) {
  (async () => {
    await connectDB();
    const changed = await syncMatches();
    console.log(`Sync complete. ${changed.length} matches changed.`);
    await mongoose.disconnect();
  })();
}