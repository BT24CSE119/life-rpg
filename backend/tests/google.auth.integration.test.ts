import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import createApp from '../src/app';
import prisma from '../src/config/database';

test('Google OAuth 2.0 Integration Test Suite', async (t) => {
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
  const emailGoogleNew = `guser_${timestamp}@gmail.com`;
  const emailExisting = `existing_${timestamp}@gmail.com`;

  // ── 1. VALIDATION TESTS ─────────────────────────────────────────────────────
  await t.test('1. Reject missing or empty Google credential', async () => {
    const res1 = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res1.status, 400);

    const res2 = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: '' }),
    });
    assert.equal(res2.status, 400);
  });

  await t.test('2. Reject invalid Google token', async () => {
    const res = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'totally_invalid_google_jwt_token' }),
    });
    assert.equal(res.status, 401);
  });

  // ── 2. NEW USER PROVISIONING VIA GOOGLE ──────────────────────────────────────
  await t.test('3. Google Sign-Up: Provisions new user, Character, and PlayerProfile', async () => {
    const res = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: `mock_google_token_${emailGoogleNew}`,
      }),
    });
    assert.equal(res.status, 200, 'Google auth should return 200 OK');
    const data = await res.json() as any;

    assert.ok(data.data.accessToken, 'Must return JWT access token');
    assert.equal(data.data.user.email, emailGoogleNew);
    assert.ok(data.data.user.googleId, 'Must have googleId attached');
    assert.equal(data.data.user.passwordHash, undefined, 'passwordHash must never be exposed');

    // Verify refresh cookie
    const setCookie = res.headers.get('set-cookie') || '';
    assert.ok(setCookie.includes('refresh_token='), 'Must set refresh token cookie');
    assert.ok(setCookie.includes('HttpOnly'), 'Refresh cookie must be HttpOnly');

    // Verify DB state: PlayerProfile & Character created
    const profile = await prisma.playerProfile.findUnique({
      where: { userId: data.data.user.id },
    });
    assert.ok(profile, 'Must automatically initialize PlayerProfile');
    assert.equal(profile.level, 1, 'Initial level must be 1');
    assert.equal(profile.totalXp, 0, 'Initial XP must be 0');
    assert.equal(profile.goldBalance, 0, 'Initial Gold must be 0');

    const character = await prisma.character.findUnique({
      where: { userId: data.data.user.id },
    });
    assert.ok(character, 'Must automatically initialize Character');
  });

  // ── 3. ACCOUNT LINKING FOR EXISTING USER ────────────────────────────────────
  await t.test('4. Google Sign-In links to existing email account seamlessly', async () => {
    // First, user signed up via regular email/password
    const localSignupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `hero_${timestamp}`,
        email: emailExisting,
        password: 'Password123!',
      }),
    });
    assert.equal(localSignupRes.status, 201);
    const localUserData = await localSignupRes.json() as any;
    const localUserId = localUserData.data.user.id;

    // User then clicks "Continue with Google" using the same email
    const googleLinkRes = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: `mock_google_token_${emailExisting}`,
      }),
    });
    assert.equal(googleLinkRes.status, 200);
    const googleLinkData = await googleLinkRes.json() as any;

    assert.equal(googleLinkData.data.user.id, localUserId, 'Must link to existing user ID');
    assert.ok(googleLinkData.data.user.googleId, 'googleId must now be linked');

    // Verify in DB
    const dbUser = await prisma.user.findUnique({ where: { id: localUserId } });
    assert.ok(dbUser?.googleId, 'Database user record must have googleId populated');
  });

  // ── 4. RETURNING GOOGLE USER LOGIN ──────────────────────────────────────────
  await t.test('5. Returning Google user logs in without creating duplicates', async () => {
    const repeatRes = await fetch(`${baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: `mock_google_token_${emailGoogleNew}`,
      }),
    });
    assert.equal(repeatRes.status, 200);
    const repeatData = await repeatRes.json() as any;
    assert.equal(repeatData.data.user.email, emailGoogleNew);

    const userCount = await prisma.user.count({ where: { email: emailGoogleNew } });
    assert.equal(userCount, 1, 'Should not create duplicate user records');
  });
});
