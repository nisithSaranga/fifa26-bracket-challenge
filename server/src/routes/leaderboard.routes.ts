import { Router, Request, Response, NextFunction } from 'express';
import { MatchPrediction } from '../models/MatchPrediction';

const router = Router();

/**
 * GET /api/leaderboard
 * Ranks users by total points. Public — leaderboards are for showing off.
 *
 * Built as an AGGREGATION PIPELINE — documents flow through stages:
 *   $match   -> keep only scored predictions
 *   $group   -> collapse per user: sum points, count exact hits
 *   $sort    -> best first (exact hits break ties)
 *   $limit   -> top 100
 *   $lookup  -> join in the username from the users collection
 *   $project -> shape the final response, hide everything else
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await MatchPrediction.aggregate([
      { $match: { pointsAwarded: { $ne: null } } },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$pointsAwarded' },
          predictionsScored: { $sum: 1 },
          exactScores: {
            $sum: { $cond: [{ $eq: ['$pointsAwarded', 3] }, 1, 0] },
          },
        },
      },
      { $sort: { totalPoints: -1, exactScores: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: 'users',          // MongoDB pluralizes collection names
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          username: '$userInfo.username',
          country: '$userInfo.country',
          totalPoints: 1,
          predictionsScored: 1,
          exactScores: 1,
        },
      },
    ]);

    // Add rank numbers (1st, 2nd, ...) after sorting
    const ranked = leaderboard.map((row, i) => ({ rank: i + 1, ...row }));
    res.json({ leaderboard: ranked });
  } catch (err) {
    next(err);
  }
});

export default router;