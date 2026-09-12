import { Router, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { realtimeService } from '../services/realtime.service';

const router = Router();

/**
 * GET /api/events
 * Real-time Server-Sent Events stream for authenticated users.
 */
router.get('/', (req: Request, res: Response): void => {
  // Check token from cookie or query param
  let token = req.cookies?.accessToken as string | undefined;

  if (!token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized: missing access token' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const userId = payload.sub;

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    realtimeService.addClient(userId, res);
  } catch {
    res.status(401).json({ success: false, error: 'Unauthorized: invalid or expired token' });
  }
});

export default router;
