import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getDailyQuestsHandler,
  generateDailyQuestsHandler,
  completeDailyQuestHandler,
} from '../controllers/dailyQuest.controller';

const router = Router();

router.use(authenticate);

router.get('/', getDailyQuestsHandler);
router.post('/generate', generateDailyQuestsHandler);
router.post('/:id/complete', completeDailyQuestHandler);

export default router;
