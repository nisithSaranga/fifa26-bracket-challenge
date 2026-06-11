import { Response, NextFunction } from 'express';
import { Match } from '../models/Match';
import { MatchPrediction } from '../models/MatchPrediction';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * PUT /api/predictions/:matchId
 * Create OR update my prediction for a match — one endpoint for both,
 * because the unique (user, match) index + upsert makes them the same operation.
 */
export async function upsertPrediction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { matchId } = req.params;
    const { predictedHome, predictedAway } = req.body;

    // ---- Input validation ----
    if (
      !Number.isInteger(predictedHome) || !Number.isInteger(predictedAway) ||
      predictedHome < 0 || predictedAway < 0 || predictedHome > 99 || predictedAway > 99
    ) {
      throw new ApiError(400, 'predictedHome and predictedAway must be integers 0-99');
    }

    const match = await Match.findById(matchId);
    if (!match) throw new ApiError(404, 'Match not found');

    // ---- THE KICKOFF LOCK ----
    // The server's clock vs the kickoff time from our database.
    // The client never participates in this decision: a user can change
    // their phone's clock, edit the page, or call the API directly with
    // curl — none of it matters, because this line runs on OUR machine.
    if (new Date() >= match.kickoff) {
      throw new ApiError(403, 'Predictions are locked — match has kicked off');
    }

    // ---- Atomic upsert ----
    // One database operation: update if a prediction exists, insert if not.
    // No check-then-insert gap, so no race condition. The unique index
    // (user+match) is the final guarantee underneath.
    const prediction = await MatchPrediction.findOneAndUpdate(
      { user: req.userId, match: matchId },
      { $set: { predictedHome, predictedAway } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ prediction });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/predictions/mine
 * All my predictions, newest match first — powers the "my predictions" page.
 */
export async function myPredictions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const predictions = await MatchPrediction.find({ user: req.userId })
      .populate('match', 'homeTeam awayTeam kickoff status score stage group')
      .sort({ createdAt: -1 });
    res.json({ count: predictions.length, predictions });
  } catch (err) {
    next(err);
  }
}