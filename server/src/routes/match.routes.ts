import { Router, Request, Response, NextFunction } from 'express';
import { Match } from '../models/Match';

const router = Router();

/**
 * GET /api/matches?stage=GROUP_STAGE&group=GROUP_A&status=FINISHED
 * Public — anyone can browse fixtures and results.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.stage) filter.stage = req.query.stage;
    if (req.query.group) filter.group = req.query.group;
    if (req.query.status) filter.status = req.query.status;

    const matches = await Match.find(filter).sort({ kickoff: 1 });
    res.json({ count: matches.length, matches });
  } catch (err) {
    next(err);
  }
});

/** GET /api/matches/upcoming — next 12 matches, for the home page. */
router.get('/upcoming', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await Match.find({ kickoff: { $gte: new Date() } })
      .sort({ kickoff: 1 })
      .limit(12);
    res.json({ matches });
  } catch (err) {
    next(err);
  }
});

/** GET /api/matches/live — currently in play. */
router.get('/live', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await Match.find({ status: { $in: ['IN_PLAY', 'PAUSED'] } })
      .sort({ kickoff: 1 });
    res.json({ matches });
  } catch (err) {
    next(err);
  }
});

export default router;
