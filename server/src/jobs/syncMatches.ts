/**
 * Fixture & result sync — football-data.org v4.
 *
 * Pulls all 104 World Cup matches and UPSERTS them into MongoDB,
 * keyed by fdMatchId. Safe to run repeatedly:
 *  - first run  -> inserts every fixture
 *  - later runs -> updates scores, statuses, knockout pairings
 *
 * Run manually:  npm run sync
 * (Phase 2 wraps this in a cron worker + Socket.io push.)
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
    // Knockout slots are "TBD" until qualified — store a placeholder
    name: t.name ?? 'To be determined',
    shortName: t.shortName ?? '',
    tla: t.tla ?? '',
    crest: t.crest ?? '',
  };
}

async function sync() {
  if (!env.footballDataKey) {
    console.error('FOOTBALL_DATA_KEY missing in .env — get a free key at football-data.org');
    process.exit(1);
  }

  await connectDB();

  console.log('Fetching World Cup fixtures from football-data.org ...');
  const resp = await fetch(FD_URL, {
    headers: { 'X-Auth-Token': env.footballDataKey },
  });

  if (!resp.ok) {
    console.error(`API error ${resp.status}: ${await resp.text()}`);
    process.exit(1);
  }

  const data = (await resp.json()) as { matches: FdMatch[] };
  console.log(`Received ${data.matches.length} matches. Upserting ...`);

  // bulkWrite = one round-trip to MongoDB instead of 104
  const ops = data.matches.map((m) => ({
    updateOne: {
      filter: { fdMatchId: m.id },
      update: {
        $set: {
          fdMatchId: m.id,
          stage: m.stage,
          group: m.group ?? null,
          matchday: m.matchday ?? null,
          kickoff: new Date(m.utcDate),
          // football-data.org statuses match our union; assert the type
          status: m.status as MatchStatus,
          minute: m.minute ?? null,
          venue: m.venue ?? null,
          homeTeam: mapTeam(m.homeTeam),
          awayTeam: mapTeam(m.awayTeam),
          score: {
            home: m.score.fullTime.home,
            away: m.score.fullTime.away,
          },
          lastSyncedAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  const result = await Match.bulkWrite(ops);
  console.log(
    `Done. inserted=${result.upsertedCount} updated=${result.modifiedCount} total=${ops.length}`
  );

  await mongoose.disconnect();
}

sync();
