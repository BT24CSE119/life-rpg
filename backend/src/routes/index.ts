import { Router } from 'express';
import healthRouter from './health';

const router = Router();

// Mount sub-routers
router.use('/health', healthRouter);

export default router;
