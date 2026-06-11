import { Schema, model, Document, Types } from 'mongoose';

/**
 * One user's score prediction for one match.
 * Created/updated freely BEFORE kickoff; frozen forever after.
 */
export interface IMatchPrediction extends Document {
  user: Types.ObjectId;       // who predicted
  match: Types.ObjectId;      // which match
  predictedHome: number;      // e.g. 2
  predictedAway: number;      // e.g. 1
  /** Points earned once the match finishes. null = not scored yet. */
  pointsAwarded: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const matchPredictionSchema = new Schema<IMatchPrediction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    match: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    predictedHome: { type: Number, required: true, min: 0, max: 99 },
    predictedAway: { type: Number, required: true, min: 0, max: 99 },
    pointsAwarded: { type: Number, default: null },
  },
  { timestamps: true }
);

/**
 * THE design decision of this file: a COMPOUND UNIQUE INDEX.
 * One user can have at most ONE prediction per match — enforced by the
 * database itself, not by our code. Even if two requests arrive in the
 * same millisecond (a race condition), MongoDB physically cannot store
 * a duplicate. Application-level checks alone can be raced; indexes can't.
 */
matchPredictionSchema.index({ user: 1, match: 1 }, { unique: true });

export const MatchPrediction = model<IMatchPrediction>('MatchPrediction', matchPredictionSchema);
