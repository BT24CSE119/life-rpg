import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getStreakHandler } from '../controllers/streak.controller';

const router = Router();

router.use(authenticate);

router.get('/', getStreakHandler);

export default router;
