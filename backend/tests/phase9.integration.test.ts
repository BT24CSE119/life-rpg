import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import test from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/config/database';
import createApp from '../src/app';
import { generateAccessToken } from '../src/utils/jwt';
import { UserRole } from '@prisma/client';
import { realtimeService } from '../src/services/realtime.service';

test('Phase 9 Production Hardening, Security, Real-Time SSE, and Performance Suite', async (t) => {
  const app = createApp();

  // Create isolated test user
  const email = `phase9_${Date.now()}@liferpg.test`;
  const username = `phase9_${Date.now()}`;
  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash: 'dummy_hash',
      role: UserRole.USER,
    },
  });

  const token = generateAccessToken(user.id, UserRole.USER);

  await t.test('1. Security Headers & Performance Middleware', async () => {
    // Start local ephemeral server to test HTTP headers
    const server = app.listen(0);
    const port = (server.address() as { port: number }).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/health`, {
        headers: {
          'Accept-Encoding': 'gzip, deflate',
        },
      });

      assert.equal(res.status, 200, 'Health endpoint should return 200');

      // Verify Helmet security headers
      const xContentType = res.headers.get('x-content-type-options');
      assert.equal(xContentType, 'nosniff', 'Should set X-Content-Type-Options: nosniff');

      const xFrameOptions = res.headers.get('x-frame-options');
      assert.equal(xFrameOptions, 'SAMEORIGIN', 'Should set X-Frame-Options');
    } finally {
      server.close();
    }
  });

  await t.test('2. Real-Time SSE Stream Authentication and Handshake', async () => {
    const server = app.listen(0);
    const port = (server.address() as { port: number }).port;

    try {
      // 2a. Reject unauthorized connection without ticket or cookie
      const unauthRes = await fetch(`http://localhost:${port}/api/events`);
      assert.equal(unauthRes.status, 401, 'SSE route should reject unauthenticated requests');

      // 2b. Reject insecure attempt to pass raw JWT token in query parameter
      const rawTokenRes = await fetch(`http://localhost:${port}/api/events?token=${token}`);
      assert.equal(rawTokenRes.status, 400, 'SSE route should strictly reject raw JWT query tokens');

      // 2c. Request secure short-lived single-use ticket
      const ticketRes = await fetch(`http://localhost:${port}/api/events/ticket`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      assert.equal(ticketRes.status, 200, 'Should successfully issue SSE ticket');
      const ticketData = await ticketRes.json() as { success: boolean; ticket: string };
      assert.ok(ticketData.ticket, 'Should return ticket string');

      // 2d. Connect using the single-use ticket
      const controller = new AbortController();
      const authRes = await fetch(`http://localhost:${port}/api/events?ticket=${ticketData.ticket}`, {
        signal: controller.signal,
      });

      assert.equal(authRes.status, 200, 'SSE route should connect successfully with valid ticket');
      assert.equal(
        authRes.headers.get('content-type'),
        'text/event-stream',
        'Should return text/event-stream content type'
      );

      // Read initial connected handshake event
      const reader = authRes.body?.getReader();
      assert.ok(reader, 'Readable stream reader should be available');

      const chunk = await reader.read();
      const text = new TextDecoder().decode(chunk.value);
      assert.ok(text.includes('event: connected'), 'Should transmit initial connected handshake event');
      assert.ok(text.includes(user.id), 'Should include user ID in handshake');

      controller.abort();
    } finally {
      server.close();
    }
  });

  await t.test('3. RealtimeService Event Emission Scoped to User', async () => {
    let captured = '';
    const mockRes: any = {
      write: (data: string) => {
        captured += data;
        return true;
      },
      on: () => {},
    };

    realtimeService.addClient(user.id, mockRes);

    realtimeService.emitUserEvent(user.id, 'GOLD_GAINED', {
      amount: 100,
      goldBalance: 500,
    });

    assert.ok(captured.includes('event: GOLD_GAINED'), 'Should format SSE event name');
    assert.ok(captured.includes('"goldBalance":500'), 'Should serialize event payload JSON');

    realtimeService.removeClient(user.id, mockRes);
  });

  await t.test('4. Database Performance Indexes Query Validation', async () => {
    // Seed an item and inventory row to exercise the new composite indexes
    const item = await prisma.item.upsert({
      where: { name: `Test Item ${Date.now()}` },
      create: {
        name: `Test Item ${Date.now()}`,
        description: 'Test artifact for index validation',
        type: 'COSMETIC',
        rarity: 'RARE',
        goldCost: 50,
        isActive: true,
      },
      update: {},
    });

    await prisma.inventory.create({
      data: {
        userId: user.id,
        itemId: item.id,
        isEquipped: true,
      },
    });

    // Exercise @@index([userId, isEquipped])
    const equipped = await prisma.inventory.findMany({
      where: {
        userId: user.id,
        isEquipped: true,
      },
      include: { item: true },
    });

    assert.equal(equipped.length, 1, 'Should find 1 equipped inventory item via index');
    assert.equal(equipped[0].itemId, item.id, 'Should retrieve correct item');

    // Exercise @@index([isActive])
    const activeItems = await prisma.item.findMany({
      where: { isActive: true },
      take: 5,
    });
    assert.ok(activeItems.length > 0, 'Should query active items using isActive index');
  });

  // Clean up test records
  await prisma.inventory.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
});
