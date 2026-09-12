import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAchievementsHandler,
  getUnlockedAchievementsHandler,
} from '../controllers/achievement.controller';

const router = Router();

router.use(authenticate);

router.get('/', getAchievementsHandler);
router.get('/unlocked', getUnlockedAchievementsHandler);

export default router;
