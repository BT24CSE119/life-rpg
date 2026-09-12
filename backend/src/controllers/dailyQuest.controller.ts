import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/auth';
import { getDailyQuests, generateDailyQuests, completeDailyQuest } from '../services/dailyQuest.service';

const getUserId = (req: Request): string => (req as AuthenticatedRequest).user.id;

export const getDailyQuestsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const dateStr = typeof req.query.date === 'string' ? req.query.date : undefined;
    const quests = await getDailyQuests(userId, dateStr);
    res.status(200).json({
      success: true,
      message: 'Daily quests retrieved',
      data: quests,
    });
  } catch (err) {
    next(err);
  }
};

export const generateDailyQuestsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const dateStr = typeof req.body?.date === 'string' ? req.body.date : undefined;
    const quests = await generateDailyQuests(userId, dateStr);
    res.status(201).json({
      success: true,
      message: 'Daily quests generated',
      data: quests,
    });
  } catch (err) {
    next(err);
  }
};

export const completeDailyQuestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await completeDailyQuest(userId, id);
    res.status(200).json({
      success: true,
      message: result.duplicateCompletion ? 'Quest was already completed' : 'Daily quest completed!',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
