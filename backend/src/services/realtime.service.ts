import { Response } from 'express';

export type RealtimeEventType =
  | 'QUEST_COMPLETED'
  | 'DAILY_QUEST_COMPLETED'
  | 'XP_GAINED'
  | 'GOLD_GAINED'
  | 'LEVEL_UP'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'STREAK_UPDATED'
  | 'ITEM_PURCHASED'
  | 'ITEM_EQUIPPED'
  | 'ITEM_UNEQUIPPED'
  | 'NOTIFICATION_CREATED';

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  userId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

class RealtimeService {
  private clients: Map<string, Set<Response>> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Register a new SSE connection for a user.
   */
  public addClient(userId: string, res: Response): void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(res);

    // Initial connection handshake
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', userId })}\n\n`);

    res.on('close', () => {
      this.removeClient(userId, res);
    });
  }

  /**
   * Remove a disconnected SSE client.
   */
  public removeClient(userId: string, res: Response): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(res);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  /**
   * Emit a real-time event to all active sessions of a user.
   */
  public emitUserEvent(
    userId: string,
    type: RealtimeEventType,
    data: Record<string, unknown> = {}
  ): void {
    const userClients = this.clients.get(userId);
    if (!userClients || userClients.size === 0) return;

    const payload: RealtimeEventPayload = {
      type,
      userId,
      data,
      timestamp: new Date().toISOString(),
    };

    const message = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;

    for (const res of userClients) {
      try {
        res.write(message);
      } catch (err) {
        console.warn(`[RealtimeService] Failed to write event to client: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Periodic keepalive heartbeat every 25 seconds.
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      for (const [, clients] of this.clients) {
        for (const res of clients) {
          try {
            res.write(': heartbeat\n\n');
          } catch {
            // Client closed, will be removed on close event
          }
        }
      }
    }, 25000);

    // Prevent blocking process exit
    if (this.heartbeatTimer.unref) {
      this.heartbeatTimer.unref();
    }
  }
}

export const realtimeService = new RealtimeService();
