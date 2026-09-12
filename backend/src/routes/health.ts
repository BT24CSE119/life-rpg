import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

/**
 * GET /api/health
 * Health-check endpoint — verifies the API and database connectivity.
 */
router.get('/', async (_req: Request, res: Response) => {
  const startTime = Date.now();

  // Test database connection
  let dbStatus: 'connected' | 'disconnected' | 'unconfigured' = 'disconnected';
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    const error = err as Error;
    // Treat missing DATABASE_URL as unconfigured, not an error
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL === '') {
      dbStatus = 'unconfigured';
      dbError = 'DATABASE_URL not configured';
    } else {
      dbError = error.message;
    }
  }

  const responseTime = Date.now() - startTime;

  res.status(200).json({
    success: true,
    message: 'Life RPG API is running',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV ?? 'development',
      database: {
        status: dbStatus,
        ...(dbError && { error: dbError }),
      },
    },
  });
});

export default router;
