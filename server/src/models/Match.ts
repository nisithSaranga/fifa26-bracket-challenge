import { Schema, model, Document } from 'mongoose';

/** Mirrors football-data.org statuses we care about. */
export type MatchStatus =
  | 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

interface TeamRef {
  fdId: number | null;   // football-data.org team id
  name: string;
  shortName: string;
  tla: string;           // three-letter code e.g. "BRA"
  crest: string;         // flag/crest image URL
}

export interface IMatch extends Document {
  fdMatchId: number;       // football-data.org match id — our sync key
  stage: string;           // GROUP_STAGE, ROUND_OF_32, ..., FINAL
  group: string | null;    // "GROUP_A" ... "GROUP_L" (null in knockouts)
  matchday: number | null;
  kickoff: Date;           // single source of truth for prediction locking
  status: MatchStatus;
  minute: number | null;   // live match minute
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  score: { home: number | null; away: number | null };
  venue: string | null;
  lastSyncedAt: Date;
}

const teamRefSchema = new Schema<TeamRef>(
  {
    fdId: { type: Number, default: null },
    name: { type: String, required: true },
    shortName: { type: String, default: '' },
    tla: { type: String, default: '' },
    crest: { type: String, default: '' },
  },
  { _id: false }
);

const matchSchema = new Schema<IMatch>(
  {
    fdMatchId: { type: Number, required: true, unique: true },
    stage: { type: String, required: true, index: true },
    group: { type: String, default: null, index: true },
    matchday: { type: Number, default: null },
    kickoff: { type: Date, required: true, index: true },
    status: { type: String, required: true, default: 'SCHEDULED' },
    minute: { type: Number, default: null },
    homeTeam: { type: teamRefSchema, required: true },
    awayTeam: { type: teamRefSchema, required: true },
    score: {
      home: { type: Number, default: null },
      away: { type: Number, default: null },
    },
    venue: { type: String, default: null },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Match = model<IMatch>('Match', matchSchema);
