import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { verifyAccessToken } from '../utils/jwt';
import { realtimeService } from '../services/realtime.service';

const router = Router();

// In-memory store for short-lived (30s) single-use SSE connection tickets
const ticketStore = new Map<string, { userId: string; expiresAt: number }>();

// Periodic ticket purge every 60 seconds
const purgeTimer = setInterval(() => {
  const now = Date.now();
  for (const [ticket, data] of ticketStore.entries()) {
    if (data.expiresAt < now) {
      ticketStore.delete(ticket);
    }
  }
}, 60000);

if (purgeTimer.unref) {
  purgeTimer.unref();
}

/**
 * Helper to extract and verify access token from request (Cookie or Bearer header).
 * Query parameters are strictly disallowed for raw JWTs.
 */
const authenticateToken = (req: Request): string | null => {
  let token = req.cookies?.accessToken as string | undefined;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return null;

  try {
    const payload = verifyAccessToken(token);
    return payload.sub;
  } catch {
    return null;
  }
};

/**
 * POST /api/events/ticket
 * Issue a short-lived (30s), single-use ticket for connecting to the SSE stream.
 * Prevents long-lived JWTs from being exposed in URLs/query parameters.
 */
router.post('/ticket', (req: Request, res: Response): void => {
  const userId = authenticateToken(req);

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized: valid session required to issue ticket' });
    return;
  }

  const ticket = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 30000; // 30 seconds

  ticketStore.set(ticket, { userId, expiresAt });

  res.status(200).json({
    success: true,
    ticket,
    expiresInSeconds: 30,
  });
});

/**
 * GET /api/events
 * Real-time Server-Sent Events stream for authenticated users.
 * Supports:
 *   1. Authenticated HttpOnly cookie (accessToken)
 *   2. Short-lived single-use ticket (?ticket=...)
 * Explicitly rejects raw JWT in query parameter (?token=...) to avoid URL leakage.
 */
router.get('/', (req: Request, res: Response): void => {
  // Reject raw JWT query parameter attempt
  if (req.query.token) {
    res.status(400).json({
      success: false,
      error: 'Insecure connection attempt: passing raw JWT access tokens in query parameters is prohibited. Use an authenticated cookie or request a short-lived ticket via POST /api/events/ticket.',
    });
    return;
  }

  let userId: string | null = null;

  // 1. Check HttpOnly cookie or Bearer header
  userId = authenticateToken(req);

  // 2. If not authenticated by header/cookie, check short-lived single-use ticket
  if (!userId && typeof req.query.ticket === 'string') {
    const ticket = req.query.ticket;
    const ticketData = ticketStore.get(ticket);

    if (ticketData) {
      // Immediately burn ticket so it cannot be replayed
      ticketStore.delete(ticket);

      if (ticketData.expiresAt >= Date.now()) {
        userId = ticketData.userId;
      }
    }
  }

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized: valid session or single-use ticket required' });
    return;
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  realtimeService.addClient(userId, res);
});

export default router;
