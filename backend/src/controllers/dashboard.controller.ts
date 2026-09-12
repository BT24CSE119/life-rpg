import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/auth';
import { getDashboardForUser } from '../services/dashboard.service';

const getUserId = (req: Request): string => (req as AuthenticatedRequest).user.id;

export const dashboardHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getUserId(req);
    const dashboard = await getDashboardForUser(userId);

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};
