/**
 * Awards points for all FINISHED matches whose predictions
 * haven't been scored yet. Safe to run repeatedly — it only touches
 * predictions where pointsAwarded is still null. Run: npm run score
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Match } from '../models/Match';
import { MatchPrediction } from '../models/MatchPrediction';
import { scorePrediction } from '../services/scoring';

async function applyScores() {
  await connectDB();

  const finished = await Match.find({
    status: 'FINISHED',
    'score.home': { $ne: null },
    'score.away': { $ne: null },
  });
  console.log(`${finished.length} finished matches found`);

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

  console.log(`Scored ${scored} predictions.`);
  await mongoose.disconnect();
}

applyScores();