import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listQuests,
  createQuestHandler,
  getQuestHandler,
  updateQuestHandler,
  deleteQuestHandler,
  completeQuestHandler,
} from '../controllers/quest.controller';

const router = Router();

// All quest routes require authentication
router.use(authenticate);

/**
 * GET  /api/quests          — list user's quests (with optional ?status= &priority= filters)
 * POST /api/quests          — create a new quest
 */
router.get('/', listQuests);
router.post('/', createQuestHandler);

/**
 * GET    /api/quests/:id          — get a single quest
 * PATCH  /api/quests/:id          — update a quest
 * DELETE /api/quests/:id          — delete a quest
 */
router.get('/:id', getQuestHandler);
router.patch('/:id', updateQuestHandler);
router.delete('/:id', deleteQuestHandler);

/**
 * POST /api/quests/:id/complete   — mark quest as completed
 */
router.post('/:id/complete', completeQuestHandler);

export default router;
