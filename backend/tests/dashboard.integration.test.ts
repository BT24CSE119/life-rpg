import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import dotenv from 'dotenv';
import path from 'node:path';
import prisma from '../src/config/database';
import { getDashboardForUser } from '../src/services/dashboard.service';
import { completeQuestWithXp } from '../src/services/quest.service';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

test('Phase 6 Dashboard service delivers accurate, isolated, real-time data for authenticated user', async () => {
  const suffix = randomUUID();
  const userA = await prisma.user.create({
    data: {
      email: `dash-a-${suffix}@example.test`,
      username: `dasha-${suffix}`,
      passwordHash: 'test-only-hash',
    },
  });
  const userB = await prisma.user.create({
    data: {
      email: `dash-b-${suffix}@example.test`,
      username: `dashb-${suffix}`,
      passwordHash: 'test-only-hash',
    },
  });

  try {
    // ── 1. Initial zero-state dashboard for new user ───────────────────────────
    const dashInitial = await getDashboardForUser(userA.id);
    assert.equal(dashInitial.player.name, `dasha-${suffix}`);
    assert.equal(dashInitial.player.level, 1);
    assert.equal(dashInitial.player.totalXp, 0);
    assert.equal(dashInitial.player.goldBalance, 0);
    assert.equal(dashInitial.quests.total, 0);
    assert.equal(dashInitial.quests.active, 0);
    assert.equal(dashInitial.quests.completed, 0);
    assert.equal(dashInitial.quests.completionPercentage, 0);
    assert.equal(dashInitial.activeQuests.length, 0);
    assert.equal(dashInitial.recentlyCompletedQuests.length, 0);
    assert.equal(dashInitial.recentActivity.length, 0);

    // Verify no password hash or secrets exposed
    assert.equal('passwordHash' in dashInitial.player, false);
    assert.equal('password' in dashInitial.player, false);

    // ── 2. Create quests for User A & User B ──────────────────────────────────
    const qA1 = await prisma.quest.create({
      data: { userId: userA.id, title: 'Quest A1 High', priority: 'HIGH' },
    });
    const qA2 = await prisma.quest.create({
      data: { userId: userA.id, title: 'Quest A2 Low', priority: 'LOW' },
    });
    const qB1 = await prisma.quest.create({
      data: { userId: userB.id, title: 'Quest B1 Private', priority: 'MEDIUM' },
    });

    // ── 3. Active quests metrics and ordering ──────────────────────────────────
    const dashWithQuests = await getDashboardForUser(userA.id);
    assert.equal(dashWithQuests.quests.total, 2);
    assert.equal(dashWithQuests.quests.todo, 2);
    assert.equal(dashWithQuests.quests.active, 2);
    assert.equal(dashWithQuests.quests.completed, 0);
    assert.equal(dashWithQuests.quests.completionPercentage, 0);
    assert.equal(dashWithQuests.activeQuests.length, 2);

    // Sorted by priority descending: HIGH before LOW
    assert.equal(dashWithQuests.activeQuests[0].id, qA1.id);
    assert.equal(dashWithQuests.activeQuests[0].xpReward, 50);
    assert.equal(dashWithQuests.activeQuests[0].goldReward, 30);
    assert.equal(dashWithQuests.activeQuests[1].id, qA2.id);
    assert.equal(dashWithQuests.activeQuests[1].xpReward, 10);
    assert.equal(dashWithQuests.activeQuests[1].goldReward, 5);

    // Cross-user isolation: User A's dashboard must NOT contain User B's quest
    assert.equal(
      dashWithQuests.activeQuests.some((q) => q.id === qB1.id),
      false
    );

    // ── 4. Complete a quest and verify real-time dashboard sync ────────────────
    const compResult = await completeQuestWithXp(qA1.id, userA.id);
    assert.equal(compResult.reward.xpAwarded, 50);
    assert.equal(compResult.reward.goldAwarded, 30);

    const dashAfterComplete = await getDashboardForUser(userA.id);
    // Metrics updated
    assert.equal(dashAfterComplete.quests.total, 2);
    assert.equal(dashAfterComplete.quests.active, 1);
    assert.equal(dashAfterComplete.quests.completed, 1);
    assert.equal(dashAfterComplete.quests.completionPercentage, 50);

    // Player progression updated
    assert.equal(dashAfterComplete.player.totalXp, 50);
    assert.equal(dashAfterComplete.player.goldBalance, 30);

    // Active quests updated (only qA2 remains)
    assert.equal(dashAfterComplete.activeQuests.length, 1);
    assert.equal(dashAfterComplete.activeQuests[0].id, qA2.id);

    // Recently completed list
    assert.equal(dashAfterComplete.recentlyCompletedQuests.length, 1);
    assert.equal(dashAfterComplete.recentlyCompletedQuests[0].id, qA1.id);
    assert.equal(dashAfterComplete.recentlyCompletedQuests[0].title, 'Quest A1 High');

    // Recent activity feed contains activities
    assert.ok(dashAfterComplete.recentActivity.length >= 3);
    const activityTypes = dashAfterComplete.recentActivity.map((a) => a.type);
    assert.ok(activityTypes.includes('QUEST_COMPLETED'));
    assert.ok(activityTypes.includes('XP_EARNED'));
    assert.ok(activityTypes.includes('GOLD_EARNED'));

    // ── 5. User B dashboard remains clean and isolated ─────────────────────────
    const dashUserB = await getDashboardForUser(userB.id);
    assert.equal(dashUserB.player.name, `dashb-${suffix}`);
    assert.equal(dashUserB.player.totalXp, 0);
    assert.equal(dashUserB.player.goldBalance, 0);
    assert.equal(dashUserB.quests.total, 1);
    assert.equal(dashUserB.quests.active, 1);
    assert.equal(dashUserB.quests.completed, 0);
    assert.equal(dashUserB.activeQuests.length, 1);
    assert.equal(dashUserB.activeQuests[0].id, qB1.id);
    assert.equal(dashUserB.recentlyCompletedQuests.length, 0);
    assert.equal(dashUserB.recentActivity.length, 0);
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
  }
});
