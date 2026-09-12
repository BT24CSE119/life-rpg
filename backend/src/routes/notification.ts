import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
} from '../controllers/notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', getNotificationsHandler);
router.get('/unread-count', getUnreadCountHandler);
router.patch('/:id/read', markAsReadHandler);
router.post('/read-all', markAllAsReadHandler);

export default router;
