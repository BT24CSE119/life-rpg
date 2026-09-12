import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import test from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/config/database';
import createApp from '../src/app';
import { generateAccessToken, generateRefreshToken, hashToken } from '../src/utils/jwt';
import { hashPassword } from '../src/utils/password';
import { UserRole, QuestPriority, QuestStatus } from '@prisma/client';
import { realtimeService } from '../src/services/realtime.service';

const extractCookie = (res: Response, name: string): string => {
  const getSetCookie = (res.headers as any).getSetCookie?.bind(res.headers);
  const cookieList: string[] = getSetCookie ? getSetCookie() : [res.headers.get('set-cookie') || ''];
  for (const c of cookieList) {
    if (c) {
      const match = c.match(new RegExp(`${name}=([^;]+)`));
      if (match) return `${name}=${match[1]}`;
    }
  }
  return '';
};

test('Phase 10 Comprehensive Security, Authentication & Authorization Audit Suite', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  const port = (server.address() as { port: number }).port;
  const baseUrl = `http://localhost:${port}/api`;

  const timestamp = Date.now();
  const password = 'StrongPassword123!';
  const hashedPassword = await hashPassword(password);

  // Pre-seed User A and User B so IDs are reliably available for all tests
  const emailA = `sec_usera_${timestamp}@liferpg.test`;
  const usernameA = `sec_usera_${timestamp}`;
  const userA = await prisma.user.create({
    data: {
      email: emailA,
      username: usernameA,
      passwordHash: hashedPassword,
      role: UserRole.USER,
    },
  });

  const emailB = `sec_userb_${timestamp}@liferpg.test`;
  const usernameB = `sec_userb_${timestamp}`;
  const userB = await prisma.user.create({
    data: {
      email: emailB,
      username: usernameB,
      passwordHash: hashedPassword,
      role: UserRole.USER,
    },
  });

  let tokenA = generateAccessToken(userA.id, UserRole.USER);
  let tokenB = generateAccessToken(userB.id, UserRole.USER);

  let questAId = '';
  let notificationAId = '';
  let itemAId = '';

  t.after(async () => {
    server.close();
    // Cleanup created test records
    await prisma.notification.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.inventory.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.goldTransaction.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.xpTransaction.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.quest.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.refreshToken.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.playerProfile.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
  });

  // ── 1. AUTHENTICATION AUDIT ─────────────────────────────────────────────────
  await t.test('1. Authentication: Signup Validation & Security', async () => {
    // 1a. Password complexity enforcement (reject weak password)
    const weakRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `weak_${timestamp}@test.com`,
        username: `weak_${timestamp}`,
        password: 'password', // missing uppercase and digit
      }),
    });
    assert.equal(weakRes.status, 400, 'Weak password should be rejected with 400');

    // 1b. Unauthorized role escalation attempt (client sends role: ADMIN)
    const adminEscalateRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `admin_attempt_${timestamp}@test.com`,
        username: `admin_att_${timestamp}`,
        password,
        role: 'ADMIN', // malicious role escalation
      }),
    });
    assert.equal(adminEscalateRes.status, 201, 'Signup succeeds but ignores client-supplied role');
    const escalateData = await adminEscalateRes.json() as any;
    assert.equal(escalateData.data.user.role, 'USER', 'Server must enforce USER role and reject escalation');
    await prisma.user.delete({ where: { id: escalateData.data.user.id } });

    // 1c. Duplicate email rejection (case-insensitive)
    const duplicateRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailA.toUpperCase(), // duplicate email with uppercase
        username: `diff_${timestamp}`,
        password,
      }),
    });
    assert.equal(duplicateRes.status, 409, 'Duplicate email must be rejected with 409 Conflict');
  });

  await t.test('2. Authentication: Login, Generic Error & Cookie Security', async () => {
    // 2a. Wrong password -> generic error
    const wrongPassRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailA,
        password: 'IncorrectPassword999!',
      }),
    });
    assert.equal(wrongPassRes.status, 401);
    const wrongPassData = await wrongPassRes.json() as any;
    assert.equal(wrongPassData.error.message, 'Invalid email or password', 'Must return generic error message');

    // 2b. Unknown email -> generic error
    const unknownEmailRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `nonexistent_${timestamp}@test.com`,
        password,
      }),
    });
    assert.equal(unknownEmailRes.status, 401);
    const unknownEmailData = await unknownEmailRes.json() as any;
    assert.equal(unknownEmailData.error.message, 'Invalid email or password', 'Must return identical generic error');

    // 2c. Successful Login for User A (email case normalization)
    const loginARes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `  ${emailA.toUpperCase()}  `,
        password,
      }),
    });
    assert.equal(loginARes.status, 200, 'Login with normalized email should succeed');
    const loginAData = await loginARes.json() as any;
    tokenA = loginAData.data.accessToken;
    assert.ok(tokenA, 'Should return accessToken');
    assert.equal(loginAData.data.user.passwordHash, undefined, 'No passwordHash returned');

    // Verify refresh cookie attributes
    const setCookie = loginARes.headers.get('set-cookie') || '';
    assert.ok(setCookie.includes('refresh_token='), 'Should set refresh token cookie');
    assert.ok(setCookie.includes('HttpOnly'), 'Refresh cookie must be HttpOnly');
    assert.ok(setCookie.includes('Path=/api/auth'), 'Refresh cookie must be scoped to /api/auth');

    // Login User B to get fresh token
    const loginBRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailB, password }),
    });
    const loginBData = await loginBRes.json() as any;
    tokenB = loginBData.data.accessToken;
  });

  await t.test('3. Authentication: /me Identity & Token Verification', async () => {
    // 3a. Valid token returns user A
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json() as any;
    assert.equal(meData.data.user.id, userA.id, 'Must return User A profile');
    assert.equal(meData.data.user.passwordHash, undefined);

    // 3b. Missing token returns 401
    const missingRes = await fetch(`${baseUrl}/auth/me`);
    assert.equal(missingRes.status, 401);

    // 3c. Invalid token returns 401
    const invalidRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: 'Bearer invalid.token.signature' },
    });
    assert.equal(invalidRes.status, 401);
  });

  await t.test('4. Authentication: Refresh Token Rotation & Reuse Rejection', async () => {
    // Generate valid refresh token in DB for user A
    const rawRefresh = generateRefreshToken(userA.id);
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(rawRefresh),
        userId: userA.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const cookieHeader = `refresh_token=${rawRefresh}`;

    // 4a. Refresh session rotates tokens
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });
    assert.equal(refreshRes.status, 200, 'Valid refresh token should rotate successfully');
    const refreshData = await refreshRes.json() as any;
    assert.ok(refreshData.data.accessToken, 'Should return new accessToken');
    tokenA = refreshData.data.accessToken;

    // 4b. Replay attack: Old refresh token reuse MUST be rejected (revocation verification)
    const replayRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });
    assert.equal(replayRes.status, 401, 'Reusing previous refresh token must be rejected with 401');
  });

  await t.test('5. Authentication: Logout Session Invalidation', async () => {
    // Create a temporary refresh token
    const rawRefresh = generateRefreshToken(userA.id);
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(rawRefresh),
        userId: userA.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    const cookieHeader = `refresh_token=${rawRefresh}`;

    // Logout
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });
    assert.equal(logoutRes.status, 200);

    // Verify that logged out refresh token cannot refresh
    const postLogoutRefresh = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });
    assert.equal(postLogoutRefresh.status, 401, 'Revoked token after logout must not allow refresh');
  });

  // ── 2. AUTHORIZATION & CROSS-USER ISOLATION AUDIT ───────────────────────────
  await t.test('6. Cross-User Isolation: Quest Access, Modification & Deletion', async () => {
    // 6a. User A creates a quest
    const questRes = await fetch(`${baseUrl}/quests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: `Secret Quest of User A ${timestamp}`,
        description: 'Classified task',
        priority: 'HIGH',
      }),
    });
    assert.equal(questRes.status, 201);
    const questData = await questRes.json() as any;
    questAId = questData.data.quest.id;

    // 6b. User B attempts to read User A's quest -> MUST be 404
    const crossReadRes = await fetch(`${baseUrl}/quests/${questAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(crossReadRes.status, 404, 'User B must not be able to read User A quest');

    // 6c. User B attempts to update User A's quest -> MUST be 404
    const crossUpdateRes = await fetch(`${baseUrl}/quests/${questAId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ title: 'Hacked by User B' }),
    });
    assert.equal(crossUpdateRes.status, 404, 'User B must not be able to update User A quest');

    // 6d. User B attempts to complete User A's quest -> MUST be 404
    const crossCompleteRes = await fetch(`${baseUrl}/quests/${questAId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(crossCompleteRes.status, 404, 'User B must not be able to complete User A quest');

    // 6e. User B attempts to delete User A's quest -> MUST be 404
    const crossDeleteRes = await fetch(`${baseUrl}/quests/${questAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(crossDeleteRes.status, 404, 'User B must not be able to delete User A quest');

    // Verify User A's quest is still intact and TODO
    const verifyAQuest = await prisma.quest.findUnique({ where: { id: questAId } });
    assert.equal(verifyAQuest?.status, QuestStatus.TODO, 'Quest status should remain unaffected by unauthorized attempts');
  });

  await t.test('7. Cross-User Isolation: Inventory & Equipment', async () => {
    // Seed an item into User A's inventory
    const item = await prisma.item.upsert({
      where: { name: `Sec Title ${timestamp}` },
      create: {
        name: `Sec Title ${timestamp}`,
        description: 'Security Title',
        type: 'COSMETIC',
        category: 'TITLE',
        rarity: 'EPIC',
        goldCost: 100,
        isActive: true,
      },
      update: {},
    });
    itemAId = item.id;

    await prisma.inventory.create({
      data: {
        userId: userA.id,
        itemId: item.id,
        isEquipped: false,
      },
    });

    // User B attempts to equip User A's item -> MUST be 404
    const crossEquipRes = await fetch(`${baseUrl}/inventory/${item.id}/equip`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(crossEquipRes.status, 404, 'User B cannot equip an item they do not own');

    // User A can equip their own item
    const validEquipRes = await fetch(`${baseUrl}/inventory/${item.id}/equip`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(validEquipRes.status, 200, 'User A can equip their owned item');
  });

  await t.test('8. Cross-User Isolation: Notifications & Privacy', async () => {
    // Create private notification for User A
    const notif = await prisma.notification.create({
      data: {
        userId: userA.id,
        type: 'SYSTEM',
        title: 'Private Alert for User A',
        message: 'Top secret player notification',
      },
    });
    notificationAId = notif.id;

    // User B fetches notifications -> User A's notification must not appear
    const listBRes = await fetch(`${baseUrl}/notifications`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(listBRes.status, 200);
    const listBData = await listBRes.json() as any;
    const found = listBData.data.items.find((n: any) => n.id === notificationAId);
    assert.equal(found, undefined, 'User A notification must not be visible in User B notification feed');

    // User B attempts to mark User A's notification as read -> MUST be 404
    const crossReadNotifRes = await fetch(`${baseUrl}/notifications/${notificationAId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(crossReadNotifRes.status, 404, 'User B cannot mark User A notification as read');
  });

  // ── 3. ECONOMY & REWARDS MANIPULATION AUDIT ─────────────────────────────────
  await t.test('9. Economy Security: Client Tampering Rejection', async () => {
    // 9a. Complete quest with malicious client injection payload
    const maliciousPayload = {
      xp: 99999999,
      gold: 99999999,
      reward: 99999999,
      completed: true,
    };

    const compRes = await fetch(`${baseUrl}/quests/${questAId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify(maliciousPayload),
    });
    assert.equal(compRes.status, 200);
    const compData = await compRes.json() as any;

    // Authoritative XP for HIGH priority is 50, Gold is 30. Malicious values must be ignored.
    assert.equal(compData.data.reward.xpAwarded, 50, 'Server must enforce authoritative XP reward');
    assert.equal(compData.data.reward.goldAwarded, 30, 'Server must enforce authoritative Gold reward');

    // 9b. Re-completing already completed quest: MUST reject duplicate rewards
    const dupRes = await fetch(`${baseUrl}/quests/${questAId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(dupRes.status, 200);
    const dupData = await dupRes.json() as any;
    assert.equal(dupData.data.duplicateCompletion, true, 'Must flag duplicate completion');
    assert.equal(dupData.data.reward.xpAwarded, 0, 'Must not award duplicate XP');
    assert.equal(dupData.data.reward.goldAwarded, 0, 'Must not award duplicate Gold');

    // 9c. Shop price manipulation: Client sends price: 0 or price: 1
    const cheapItem = await prisma.item.upsert({
      where: { name: `Luxury Crown ${timestamp}` },
      create: {
        name: `Luxury Crown ${timestamp}`,
        description: 'Priceless Crown',
        type: 'COSMETIC',
        rarity: 'LEGENDARY',
        goldCost: 99999, // User A has 50 Gold, cannot afford 99999
        isActive: true,
      },
      update: {},
    });

    const maliciousBuyRes = await fetch(`${baseUrl}/shop/items/${cheapItem.id}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        price: 0, // Malicious price tampering attempt in body
        goldCost: 0,
      }),
    });
    assert.equal(maliciousBuyRes.status, 400, 'Price tampering must be ignored and purchase rejected due to insufficient Gold');
    const buyErr = await maliciousBuyRes.json() as any;
    assert.ok(buyErr.error.message.includes('Insufficient Gold'), 'Must report insufficient gold using server price');
  });

  // ── 4. REAL-TIME SSE SECURITY AUDIT ─────────────────────────────────────────
  await t.test('10. SSE Security: Single-Use Tickets, No URL JWT & Isolation', async () => {
    // 10a. Raw JWT in query parameter rejected
    const rawJwtRes = await fetch(`${baseUrl}/events?token=${tokenA}`);
    assert.equal(rawJwtRes.status, 400, 'Raw JWT in query parameter must be rejected with 400');

    // 10b. Request single-use ticket for User A
    const ticketRes = await fetch(`${baseUrl}/events/ticket`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(ticketRes.status, 200);
    const { ticket } = await ticketRes.json() as { ticket: string };
    assert.ok(ticket);

    // 10c. Connect with ticket
    const controller = new AbortController();
    const sseRes = await fetch(`${baseUrl}/events?ticket=${ticket}`, {
      signal: controller.signal,
    });
    assert.equal(sseRes.status, 200);
    assert.equal(sseRes.headers.get('content-type'), 'text/event-stream');

    const reader = sseRes.body!.getReader();
    const firstChunk = await reader.read();
    const text = new TextDecoder().decode(firstChunk.value);
    assert.ok(text.includes('event: connected'));
    assert.ok(text.includes(userA.id));

    controller.abort();

    // 10d. Ticket Replay Attack: Reusing the same burned ticket must be rejected with 401
    const replayTicketRes = await fetch(`${baseUrl}/events?ticket=${ticket}`);
    assert.equal(replayTicketRes.status, 401, 'Burned single-use ticket cannot be reused');
  });
});
