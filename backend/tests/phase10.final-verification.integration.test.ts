import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import createApp from '../src/app';
import prisma from '../src/config/database';
import { hashPassword } from '../src/utils/password';
import { UserRole, QuestDifficulty, QuestPriority, QuestStatus } from '@prisma/client';

test('Phase 10 Final Independent Verification Suite', async (t) => {
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3001;
  const baseUrl = `http://localhost:${port}/api`;

  t.after(() => {
    server.close();
  });

  const timestamp = Date.now();
  const password = 'Password123!';
  const passwordHash = await hashPassword(password);

  const emailA = `final_usera_${timestamp}@test.com`;
  const emailB = `final_userb_${timestamp}@test.com`;
  const emailAdmin = `final_admin_${timestamp}@test.com`;

  // Pre-seed User A, User B, and Admin User in PostgreSQL
  const userA = await prisma.user.create({
    data: {
      username: `final_usera_${timestamp}`,
      email: emailA,
      passwordHash,
      role: UserRole.USER,
    },
  });

  const userB = await prisma.user.create({
    data: {
      username: `final_userb_${timestamp}`,
      email: emailB,
      passwordHash,
      role: UserRole.USER,
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      username: `final_admin_${timestamp}`,
      email: emailAdmin,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  // Helper to extract cookie value
  const extractCookie = (res: Response, name: string): string => {
    const raw = res.headers.get('set-cookie') || '';
    const match = raw.match(new RegExp(`${name}=([^;]+)`));
    return match ? match[1] : '';
  };

  let tokenA = '';
  let tokenB = '';
  let tokenAdmin = '';
  let questAId = '';

  // ── 1. SIGNUP VALIDATION & INJECTION AUDIT ───────────────────────────────────
  await t.test('1. Signup validation: weak password, role injection, whitespace trimming', async () => {
    // 1a. Weak password rejection
    const weakRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `weak_${timestamp}`,
        email: `weak_${timestamp}@test.com`,
        password: 'weak',
      }),
    });
    assert.equal(weakRes.status, 400);

    // 1b. Role escalation attempt (client sends role: 'ADMIN')
    const roleHackRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `hack_${timestamp}`,
        email: `hack_${timestamp}@test.com`,
        password: 'StrongPassword123!',
        role: 'ADMIN',
      }),
    });
    assert.equal(roleHackRes.status, 201);
    const roleHackData = await roleHackRes.json() as any;
    assert.equal(roleHackData.data.user.role, 'USER', 'Server must ignore client-injected ADMIN role');

    // 1c. Duplicate email conflict (409)
    const dupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `dup_${timestamp}`,
        email: emailA.toUpperCase(), // Case-insensitive collision
        password: 'Password123!',
      }),
    });
    assert.equal(dupRes.status, 409, 'Duplicate case-insensitive email must yield 409 Conflict');
  });

  // ── 2. LOGIN SECURITY & GENERIC ERRORS ──────────────────────────────────────
  await t.test('2. Login security: generic 401 error message & HttpOnly cookie', async () => {
    // 2a. Wrong password
    const wrongPassRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailA, password: 'WrongPassword999!' }),
    });
    assert.equal(wrongPassRes.status, 401);
    const wrongPassData = await wrongPassRes.json() as any;

    // 2b. Unknown email
    const unknownRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `nonexistent_${timestamp}@test.com`, password: 'Password123!' }),
    });
    assert.equal(unknownRes.status, 401);
    const unknownData = await unknownRes.json() as any;

    assert.equal(wrongPassData.error.message, unknownData.error.message, 'Must return identical generic error to prevent user enumeration');
    assert.equal(wrongPassData.error.message, 'Invalid email or password');

    // 2c. Successful Login User A
    const loginARes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `  ${emailA.toUpperCase()}  `, password }),
    });
    assert.equal(loginARes.status, 200);
    const loginAData = await loginARes.json() as any;
    tokenA = loginAData.data.accessToken;
    assert.ok(tokenA, 'User A access token returned');
    assert.equal(loginAData.data.user.passwordHash, undefined, 'passwordHash must never be exposed');

    const setCookie = loginARes.headers.get('set-cookie') || '';
    assert.ok(setCookie.includes('HttpOnly'), 'Refresh cookie must be HttpOnly');
    assert.ok(setCookie.includes('Path=/api/auth'), 'Refresh cookie must be scoped to /api/auth');

    // Login User B
    const loginBRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailB, password }),
    });
    const loginBData = await loginBRes.json() as any;
    tokenB = loginBData.data.accessToken;

    // Login Admin
    const loginAdminRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailAdmin, password }),
    });
    const loginAdminData = await loginAdminRes.json() as any;
    tokenAdmin = loginAdminData.data.accessToken;
  });

  // ── 3. TOKEN INTEGRITY & EXPIRATION ─────────────────────────────────────────
  await t.test('3. Token integrity: missing, invalid, malformed, and expired tokens', async () => {
    // 3a. Missing token
    const noTokenRes = await fetch(`${baseUrl}/auth/me`);
    assert.equal(noTokenRes.status, 401);

    // 3b. Malformed token
    const badTokenRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: 'Bearer thisisnotavalidtoken' },
    });
    assert.equal(badTokenRes.status, 401);

    // 3c. Expired token
    const expiredToken = jwt.sign(
      { sub: userA.id, role: 'USER', type: 'access' },
      process.env.JWT_ACCESS_SECRET || 'fallback_secret',
      { expiresIn: '-1s' }
    );
    const expiredRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(expiredRes.status, 401);
    const expiredData = await expiredRes.json() as any;
    assert.ok(expiredData.error.message.includes('expired'), 'Must report session expired');

    // 3d. Valid token returns correct user
    const validRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(validRes.status, 200);
    const validData = await validRes.json() as any;
    assert.equal(validData.data.user.id, userA.id);
    assert.equal(validData.data.user.passwordHash, undefined);
  });

  // ── 4. REFRESH ROTATION & REUSE REJECTION ───────────────────────────────────
  await t.test('4. Refresh token rotation, replay attack rejection and family revocation', async () => {
    // Fresh login for User A to inspect refresh token
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailA, password }),
    });
    const rawRefresh1 = extractCookie(loginRes, 'refresh_token');
    assert.ok(rawRefresh1, 'Must receive initial refresh token');

    // Legitimate rotation
    const refreshRes1 = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${rawRefresh1}` },
    });
    assert.equal(refreshRes1.status, 200, 'First refresh must succeed');
    const rawRefresh2 = extractCookie(refreshRes1, 'refresh_token');
    assert.notEqual(rawRefresh1, rawRefresh2, 'Refresh token must rotate');

    // Replay attack with rotated token (rawRefresh1) -> MUST trigger family revocation
    const replayRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${rawRefresh1}` },
    });
    assert.equal(replayRes.status, 401, 'Replaying rotated token must be rejected');

    // Verify rawRefresh2 was revoked as part of family revocation
    const cascadeRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${rawRefresh2}` },
    });
    assert.equal(cascadeRes.status, 401, 'Family revocation must invalidate all tokens');
  });

  // ── 5. LOGOUT INVALIDATION ──────────────────────────────────────────────────
  await t.test('5. Logout session invalidation and cookie removal', async () => {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailA, password }),
    });
    const rawRefresh = extractCookie(loginRes, 'refresh_token');

    // Logout
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${rawRefresh}` },
    });
    assert.equal(logoutRes.status, 200);

    // Refresh attempt after logout must be rejected
    const postLogoutRefresh = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${rawRefresh}` },
    });
    assert.equal(postLogoutRefresh.status, 401, 'Logged out token must be revoked in DB');
  });

  // ── 6. ROLE-BASED AUTHORIZATION ─────────────────────────────────────────────
  await t.test('6. Role authorization: regular USER vs ADMIN access', async () => {
    // 6a. Unauthenticated access to /admin -> 401
    const unauthAdmin = await fetch(`${baseUrl}/admin/system-status`);
    assert.equal(unauthAdmin.status, 401);

    // 6b. Regular USER role access to /admin -> 403 Forbidden
    const userRoleAdmin = await fetch(`${baseUrl}/admin/system-status`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(userRoleAdmin.status, 403, 'Regular USER must receive 403 Forbidden');

    // 6c. ADMIN role access to /admin -> 200 OK
    const adminRoleRes = await fetch(`${baseUrl}/admin/system-status`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert.equal(adminRoleRes.status, 200, 'ADMIN role must access admin endpoint');
    const adminData = await adminRoleRes.json() as any;
    assert.ok(adminData.data.nodeVersion);
  });

  // ── 7. TWO-USER ISOLATION (QUESTS & COMPLETION) ──────────────────────────────
  await t.test('7. Cross-user isolation: Quests CRUD and completion', async () => {
    // User A creates a quest
    const createQuestRes = await fetch(`${baseUrl}/quests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        title: `Private Quest of User A ${timestamp}`,
        description: 'Restricted access',
        priority: 'HIGH',
      }),
    });
    assert.equal(createQuestRes.status, 201);
    const questData = await createQuestRes.json() as any;
    questAId = questData.data.quest.id;

    // User B attempts to read User A quest -> 404
    const crossRead = await fetch(`${baseUrl}/quests/${questAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(crossRead.status, 404, 'User B cannot read User A quest');

    // User B attempts to update User A quest -> 404
    const crossUpdate = await fetch(`${baseUrl}/quests/${questAId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ title: 'Hacked Title' }),
    });
    assert.equal(crossUpdate.status, 404, 'User B cannot update User A quest');

    // User B attempts to complete User A quest -> 404
    const crossComplete = await fetch(`${baseUrl}/quests/${questAId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(crossComplete.status, 404, 'User B cannot complete User A quest');

    // User B attempts to delete User A quest -> 404
    const crossDelete = await fetch(`${baseUrl}/quests/${questAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(crossDelete.status, 404, 'User B cannot delete User A quest');
  });

  // ── 8. ECONOMY INTEGRITY & DUPLICATE REWARD PROTECTION ───────────────────────
  await t.test('8. Economy integrity: server-authoritative rewards & duplicate lockout', async () => {
    // Malicious payload with client-injected XP & Gold
    const maliciousPayload = {
      xp: 99999999,
      gold: 99999999,
      reward: 99999999,
      amount: 99999999,
    };

    // Legitimate completion by User A
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

    // HIGH priority quest awards authoritative 50 XP, 30 Gold
    assert.equal(compData.data.reward.xpAwarded, 50, 'Server must enforce authoritative XP');
    assert.equal(compData.data.reward.goldAwarded, 30, 'Server must enforce authoritative Gold');

    // Immediate re-completion attempt -> MUST return 0 XP and 0 Gold
    const dupRes = await fetch(`${baseUrl}/quests/${questAId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(dupRes.status, 200);
    const dupData = await dupRes.json() as any;
    assert.equal(dupData.data.duplicateCompletion, true, 'Must flag duplicate completion');
    assert.equal(dupData.data.reward.xpAwarded, 0, 'No duplicate XP');
    assert.equal(dupData.data.reward.goldAwarded, 0, 'No duplicate Gold');
  });

  // ── 9. SHOP & INVENTORY SECURITY ────────────────────────────────────────────
  await t.test('9. Shop price manipulation rejection & inventory isolation', async () => {
    // Create an expensive item (User A has 30 Gold, item costs 50,000)
    const expensiveItem = await prisma.item.upsert({
      where: { name: `Diamond Armor ${timestamp}` },
      create: {
        name: `Diamond Armor ${timestamp}`,
        description: 'Impenetrable plate armor',
        type: 'COSMETIC',
        rarity: 'LEGENDARY',
        goldCost: 50000,
        isActive: true,
      },
      update: {},
    });

    // Client attempts price tampering in request body: price: 0
    const tamperRes = await fetch(`${baseUrl}/shop/items/${expensiveItem.id}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ price: 0, goldCost: 0 }),
    });
    assert.equal(tamperRes.status, 400, 'Price tampering must be ignored and transaction rejected');

    // Create an inventory item for User A
    const cheapItem = await prisma.item.upsert({
      where: { name: `Novice Cloak ${timestamp}` },
      create: {
        name: `Novice Cloak ${timestamp}`,
        description: 'Simple cloak',
        type: 'COSMETIC',
        rarity: 'COMMON',
        goldCost: 10,
        isActive: true,
      },
      update: {},
    });

    const userAInv = await prisma.inventory.create({
      data: {
        userId: userA.id,
        itemId: cheapItem.id,
        isEquipped: false,
      },
    });

    // User B attempts to equip User A's item -> MUST be 404
    const crossEquip = await fetch(`${baseUrl}/inventory/${userAInv.id}/equip`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(crossEquip.status, 404, 'User B cannot equip User A inventory item');
  });

  // ── 10. NOTIFICATION PRIVACY ────────────────────────────────────────────────
  await t.test('10. Notification privacy and cross-user isolation', async () => {
    const notifA = await prisma.notification.create({
      data: {
        userId: userA.id,
        type: 'SYSTEM',
        title: `Private Notification ${timestamp}`,
        message: 'Confidential alert for User A',
      },
    });

    // User B attempts to mark User A's notification as read -> 404
    const crossRead = await fetch(`${baseUrl}/notifications/${notifA.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(crossRead.status, 404, 'User B cannot mark User A notification as read');
  });

  // ── 11. SSE TICKET SECURITY & RAW QUERY TOKEN REJECTION ──────────────────────
  await t.test('11. SSE Security: Single-use ticket, raw query token rejection, replay lock', async () => {
    // 11a. Raw JWT in URL query parameter strictly rejected (400)
    const rawJwtRes = await fetch(`${baseUrl}/events?token=${tokenA}`);
    assert.equal(rawJwtRes.status, 400, 'Raw JWT in query string must be rejected with 400 Bad Request');

    // 11b. Issue single-use ticket
    const ticketRes = await fetch(`${baseUrl}/events/ticket`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(ticketRes.status, 200);
    const ticketData = await ticketRes.json() as any;
    const ticket = ticketData.ticket || ticketData.data?.ticket;
    assert.ok(ticket, 'Valid ticket issued');

    // 11c. Connect with ticket -> 200 SSE stream
    const sseRes = await fetch(`${baseUrl}/events?ticket=${ticket}`, {
      headers: { Accept: 'text/event-stream' },
    });
    assert.equal(sseRes.status, 200, 'Connection with valid ticket must succeed');
    assert.equal(sseRes.headers.get('content-type')?.includes('text/event-stream'), true);

    // Cancel SSE connection stream
    if (sseRes.body) {
      await sseRes.body.cancel();
    }

    // 11d. Replay burned ticket -> MUST fail with 401 Unauthorized
    const replayTicketRes = await fetch(`${baseUrl}/events?ticket=${ticket}`, {
      headers: { Accept: 'text/event-stream' },
    });
    assert.equal(replayTicketRes.status, 401, 'Burned ticket replay must be rejected with 401 Unauthorized');
  });

  // ── 12. SECURITY HEADERS & SAFE ERROR HANDLING ──────────────────────────────
  await t.test('12. Security headers (Helmet) and safe error responses', async () => {
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.equal(healthRes.status, 200);

    // Verify Helmet security headers
    assert.ok(healthRes.headers.get('x-content-type-options'), 'Must set X-Content-Type-Options: nosniff');
    assert.ok(healthRes.headers.get('x-frame-options'), 'Must set X-Frame-Options: SAMEORIGIN/DENY');

    // Malformed JSON body
    const badJsonRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'this is not valid json',
    });
    assert.equal(badJsonRes.status, 400, 'Malformed JSON must result in safe 400 Bad Request');
    const badJsonData = await badJsonRes.json() as any;
    assert.equal(badJsonData.error.stack, undefined, 'Stack traces must never be exposed');
  });
});
