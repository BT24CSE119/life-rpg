import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { dashboardHandler } from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticate);
router.get('/', dashboardHandler);

export default router;
