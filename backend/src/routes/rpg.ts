import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { goldHistoryHandler, profileHandler, statsHandler, walletHandler, xpHistoryHandler } from '../controllers/rpg.controller';

const router = Router();
router.use(authenticate);
router.get('/profile', profileHandler);
router.get('/xp-history', xpHistoryHandler);
router.get('/stats', statsHandler);
router.get('/wallet', walletHandler);
router.get('/gold-history', goldHistoryHandler);

export default router;
