import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import dotenv from 'dotenv';
import path from 'node:path';
import prisma from '../src/config/database';
import { completeQuestWithXp, createQuestSchema, updateQuestSchema } from '../src/services/quest.service';
import { getProfile, getXpHistory } from '../src/services/rpg.service';
import { calculateLevelFromXp, calculateQuestXp, getLevelProgress } from '../src/utils/rpg';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

test('Phase 4 awards authoritative XP, prevents duplicates, and enforces ownership', async () => {
  const suffix = randomUUID();
  const user = await prisma.user.create({
    data: { email: `phase4-${suffix}@example.test`, username: `phase4-${suffix}`, passwordHash: 'test-only-hash' },
  });
  const otherUser = await prisma.user.create({
    data: { email: `phase4-other-${suffix}@example.test`, username: `phase4other-${suffix}`, passwordHash: 'test-only-hash' },
  });

  try {
    assert.equal(calculateQuestXp('LOW'), 10);
    assert.equal(calculateQuestXp('MEDIUM'), 25);
    assert.equal(calculateQuestXp('HIGH'), 50);
    assert.equal(calculateLevelFromXp(0), 1);
    assert.equal(calculateLevelFromXp(100), 2);
    assert.equal(calculateLevelFromXp(1_000), 5);
    assert.deepEqual(getLevelProgress(100), {
      level: 2, totalXp: 100, currentLevelXp: 0, nextLevelXp: 200, progressPercent: 0,
    });
    assert.equal(updateQuestSchema.safeParse({ status: 'COMPLETED' }).success, false);
    assert.equal('xpAwarded' in createQuestSchema.parse({ title: 'Safe payload', xpAwarded: 999_999 }), false);

    const lowQuest = await prisma.quest.create({ data: { userId: user.id, title: 'Low quest', priority: 'LOW' } });
    const lowResult = await completeQuestWithXp(lowQuest.id, user.id);
    assert.equal(lowResult.duplicateCompletion, false);
    assert.equal(lowResult.reward.xpAwarded, 10);
    assert.equal(lowResult.quest.status, 'COMPLETED');
    assert.ok(lowResult.quest.completedAt);

    const duplicate = await completeQuestWithXp(lowQuest.id, user.id);
    assert.equal(duplicate.duplicateCompletion, true);
    assert.equal(duplicate.reward.xpAwarded, 0);
    assert.equal(await prisma.xpTransaction.count({ where: { questId: lowQuest.id } }), 1);
    assert.equal((await getProfile(user.id)).totalXp, 10);

    for (const [title, priority] of [['Medium quest', 'MEDIUM'], ['High quest', 'HIGH'], ['Level-up quest', 'HIGH']] as const) {
      const quest = await prisma.quest.create({ data: { userId: user.id, title, priority } });
      await completeQuestWithXp(quest.id, user.id);
    }
    const profile = await getProfile(user.id);
    assert.equal(profile.totalXp, 135);
    assert.equal(profile.level, 2);

    const history = await getXpHistory(user.id, 1, 20);
    assert.equal(history.entries.length, 4);
    assert.ok(history.entries.every((entry) => entry.reason === 'QUEST_COMPLETION'));

    const otherQuest = await prisma.quest.create({ data: { userId: otherUser.id, title: 'Private quest', priority: 'HIGH' } });
    await assert.rejects(() => completeQuestWithXp(otherQuest.id, user.id), { message: 'Quest not found' });
    assert.equal(await prisma.xpTransaction.count({ where: { questId: otherQuest.id } }), 0);
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: [user.id, otherUser.id] } } });
  }
});
