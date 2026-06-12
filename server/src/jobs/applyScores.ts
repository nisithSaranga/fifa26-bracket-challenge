/**
 * Awards points for finished, not-yet-scored predictions.
 * Refactored into a reusable function for the cron worker;
 * still runnable directly via: npm run score
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Match } from '../models/Match';
import { MatchPrediction } from '../models/MatchPrediction';
import { scorePrediction } from '../services/scoring';

/** Returns how many predictions were scored in this pass. */
export async function applyScores(): Promise<number> {
  const finished = await Match.find({
    status: 'FINISHED',
    'score.home': { $ne: null },
    'score.away': { $ne: null },
  });

  let scored = 0;
  for (const match of finished) {
    const pending = await MatchPrediction.find({ match: match._id, pointsAwarded: null });
    for (const p of pending) {
      p.pointsAwarded = scorePrediction(
        p.predictedHome, p.predictedAway,
        match.score.home as number, match.score.away as number
      );
      await p.save();
      scored++;
    }
  }
  return scored;
}

/** Allow direct execution: npm run score */
if (require.main === module) {
  (async () => {
    await connectDB();
    const scored = await applyScores();
    console.log(`Scored ${scored} predictions.`);
    await mongoose.disconnect();
  })();
}