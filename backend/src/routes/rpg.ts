import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { profileHandler, statsHandler, xpHistoryHandler } from '../controllers/rpg.controller';

const router = Router();
router.use(authenticate);
router.get('/profile', profileHandler);
router.get('/xp-history', xpHistoryHandler);
router.get('/stats', statsHandler);

export default router;
