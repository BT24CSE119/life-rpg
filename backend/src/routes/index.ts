import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import questRouter from './quest';
import rpgRouter from './rpg';

const router = Router();

// Mount sub-routers
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/quests', questRouter);
router.use('/rpg', rpgRouter);

export default router;
