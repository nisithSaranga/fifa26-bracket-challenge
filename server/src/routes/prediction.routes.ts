import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { upsertPrediction, myPredictions } from '../controllers/prediction.controller';

const router = Router();

// Everything about predictions requires a logged-in user.
router.use(requireAuth);

router.put('/:matchId', upsertPrediction);
router.get('/mine', myPredictions);

export default router;