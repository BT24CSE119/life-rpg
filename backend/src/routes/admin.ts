import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * GET /api/admin/system-status
 * Restricted to ADMIN role only.
 */
router.get(
  '/system-status',
  authenticate,
  requireRole(UserRole.ADMIN),
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'System operating normally in production mode',
      data: {
        uptime: process.uptime(),
        environment: process.env.NODE_ENV ?? 'development',
        nodeVersion: process.version,
      },
    });
  }
);

export default router;
