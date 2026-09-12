import { Request, Response, NextFunction } from 'express';
import { QuestStatus, QuestPriority } from '@prisma/client';
import type { AuthenticatedRequest } from '../types/auth';
import {
  createQuestSchema,
  updateQuestSchema,
  getQuests,
  getQuestById,
  createQuest,
  updateQuest,
  deleteQuest,
  completeQuestWithXp,
} from '../services/quest.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getUserId = (req: Request): string =>
  (req as AuthenticatedRequest).user.id;

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/quests
 * Returns all quests for the authenticated user.
 * Optional query params: status, priority
 */
export const listQuests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getUserId(req);

    // Validate optional filters — ignore unknown/invalid values gracefully
    const status = Object.values(QuestStatus).includes(req.query.status as QuestStatus)
      ? (req.query.status as QuestStatus)
      : undefined;

    const priority = Object.values(QuestPriority).includes(req.query.priority as QuestPriority)
      ? (req.query.priority as QuestPriority)
      : undefined;

    const quests = await getQuests(userId, { status, priority });

    res.status(200).json({
      success: true,
      message: 'Quests fetched successfully',
      data: { quests },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/quests
 */
export const createQuestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const result = createQuestSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
      });
      return;
    }

    const quest = await createQuest(userId, result.data);

    res.status(201).json({
      success: true,
      message: 'Quest created successfully',
      data: { quest },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/quests/:id
 */
export const getQuestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
      return;
    }

    const quest = await getQuestById(id, userId);

    res.status(200).json({
      success: true,
      message: 'Quest fetched successfully',
      data: { quest },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/quests/:id
 */
export const updateQuestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
      return;
    }

    const result = updateQuestSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
      });
      return;
    }

    const quest = await updateQuest(id, userId, result.data);

    res.status(200).json({
      success: true,
      message: 'Quest updated successfully',
      data: { quest },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/quests/:id
 */
export const deleteQuestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
      return;
    }

    await deleteQuest(id, userId);

    res.status(200).json({
      success: true,
      message: 'Quest deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/quests/:id/complete
 */
export const completeQuestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
      return;
    }

    const completion = await completeQuestWithXp(id, userId);

    res.status(200).json({
      success: true,
      message: completion.duplicateCompletion ? 'Quest was already completed' : 'Quest completed and rewards awarded successfully',
      data: completion,
    });
  } catch (err) {
    next(err);
  }
};
