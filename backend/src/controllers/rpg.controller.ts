import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../types/auth';
import { getGoldHistory, getLeaderboard, getProfile, getStats, getWallet, getXpHistory } from '../services/rpg.service';

const getUserId = (req: Request): string => (req as AuthenticatedRequest).user.id;
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const profileHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'RPG profile fetched successfully', data: { profile: await getProfile(getUserId(req)) } });
  } catch (error) { next(error); }
};

export const xpHistoryHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { message: 'Invalid pagination parameters' } });
      return;
    }
    res.status(200).json({ success: true, message: 'XP history fetched successfully', data: await getXpHistory(getUserId(req), parsed.data.page, parsed.data.limit) });
  } catch (error) { next(error); }
};

export const statsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'RPG stats fetched successfully', data: { stats: await getStats(getUserId(req)) } });
  } catch (error) { next(error); }
};

export const walletHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'Gold wallet fetched successfully', data: await getWallet(getUserId(req)) });
  } catch (error) { next(error); }
};

export const goldHistoryHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: { message: 'Invalid pagination parameters' } });
      return;
    }
    res.status(200).json({ success: true, message: 'Gold history fetched successfully', data: await getGoldHistory(getUserId(req), parsed.data.page, parsed.data.limit) });
  } catch (error) { next(error); }
};

export const leaderboardHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sortBy = req.query.sortBy === 'streak' ? 'streak' : 'level';
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const leaderboard = await getLeaderboard(sortBy, limit);
    res.status(200).json({ success: true, message: 'Leaderboard fetched successfully', data: { leaderboard } });
  } catch (error) { next(error); }
};
