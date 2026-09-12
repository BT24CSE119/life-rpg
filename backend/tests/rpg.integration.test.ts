import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import dotenv from 'dotenv';
import path from 'node:path';
import prisma from '../src/config/database';
import { completeQuestWithXp, createQuestSchema, updateQuestSchema } from '../src/services/quest.service';
import { getGoldHistory, getProfile, getWallet, getXpHistory } from '../src/services/rpg.service';
import {
  calculateLevelFromXp,
  calculateQuestGold,
  calculateQuestGoldReward,
  calculateQuestXp,
  calculateQuestXpReward,
  getLevelProgress,
} from '../src/utils/rpg';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

test('Phase 4 & 5 awards authoritative XP and Gold, maintains ledger, prevents duplicates, and enforces ownership', async () => {
  const suffix = randomUUID();
  const user = await prisma.user.create({
    data: { email: `phase5-${suffix}@example.test`, username: `phase5-${suffix}`, passwordHash: 'test-only-hash' },
  });
  const otherUser = await prisma.user.create({
    data: { email: `phase5-other-${suffix}@example.test`, username: `phase5other-${suffix}`, passwordHash: 'test-only-hash' },
  });

  try {
    // ── 1. Reward formula verification ─────────────────────────────────────────
    assert.equal(calculateQuestXp('LOW'), 10);
    assert.equal(calculateQuestXp('MEDIUM'), 25);
    assert.equal(calculateQuestXp('HIGH'), 50);
    assert.equal(calculateQuestXpReward({ priority: 'LOW' }), 10);

    assert.equal(calculateQuestGold('LOW'), 5);
    assert.equal(calculateQuestGold('MEDIUM'), 15);
    assert.equal(calculateQuestGold('HIGH'), 30);
    assert.equal(calculateQuestGoldReward({ priority: 'LOW' }), 5);
    assert.equal(calculateQuestGoldReward({ priority: 'MEDIUM' }), 15);
    assert.equal(calculateQuestGoldReward({ priority: 'HIGH' }), 30);

    assert.equal(calculateLevelFromXp(0), 1);
    assert.equal(calculateLevelFromXp(100), 2);
    assert.equal(calculateLevelFromXp(1_000), 5);
    assert.deepEqual(getLevelProgress(100), {
      level: 2, totalXp: 100, currentLevelXp: 0, nextLevelXp: 200, progressPercent: 0,
    });

    // ── 2. Security & schema protection ────────────────────────────────────────
    assert.equal(updateQuestSchema.safeParse({ status: 'COMPLETED' }).success, false);
    const parsedPayload = createQuestSchema.parse({
      title: 'Safe payload',
      xpAwarded: 999_999,
      gold: 999_999,
      goldReward: 999_999,
      reward: 999_999,
      status: 'COMPLETED',
    });
    assert.equal('xpAwarded' in parsedPayload, false);
    assert.equal('gold' in parsedPayload, false);
    assert.equal('goldReward' in parsedPayload, false);
    assert.equal('reward' in parsedPayload, false);
    assert.equal('status' in parsedPayload, false);

    // ── 3. Initial wallet state ────────────────────────────────────────────────
    const initialWallet = await getWallet(user.id);
    assert.equal(initialWallet.goldBalance, 0);

    // ── 4. Atomic completion & rewards (LOW: 10 XP, 5 Gold) ───────────────────
    const lowQuest = await prisma.quest.create({ data: { userId: user.id, title: 'Low quest', priority: 'LOW' } });
    const lowResult = await completeQuestWithXp(lowQuest.id, user.id);
    assert.equal(lowResult.duplicateCompletion, false);
    assert.equal(lowResult.reward.xpAwarded, 10);
    assert.equal(lowResult.reward.goldAwarded, 5);
    assert.equal(lowResult.rewards.xp, 10);
    assert.equal(lowResult.rewards.gold, 5);
    assert.equal(lowResult.progression.goldBalance, 5);
    assert.equal(lowResult.rpg.goldBalance, 5);
    assert.equal(lowResult.quest.status, 'COMPLETED');
    assert.ok(lowResult.quest.completedAt);

    // Verify database state
    const walletAfterLow = await getWallet(user.id);
    assert.equal(walletAfterLow.goldBalance, 5);
    const goldTxsAfterLow = await prisma.goldTransaction.findMany({ where: { questId: lowQuest.id } });
    assert.equal(goldTxsAfterLow.length, 1);
    assert.equal(goldTxsAfterLow[0].amount, 5);
    assert.equal(goldTxsAfterLow[0].balanceAfter, 5);
    assert.equal(goldTxsAfterLow[0].type, 'QUEST_REWARD');
    assert.equal(goldTxsAfterLow[0].reason, 'QUEST_COMPLETION');

    // ── 5. Duplicate completion protection ─────────────────────────────────────
    const duplicate = await completeQuestWithXp(lowQuest.id, user.id);
    assert.equal(duplicate.duplicateCompletion, true);
    assert.equal(duplicate.reward.xpAwarded, 0);
    assert.equal(duplicate.reward.goldAwarded, 0);
    assert.equal(duplicate.rewards.xp, 0);
    assert.equal(duplicate.rewards.gold, 0);
    assert.equal(await prisma.xpTransaction.count({ where: { questId: lowQuest.id } }), 1);
    assert.equal(await prisma.goldTransaction.count({ where: { questId: lowQuest.id } }), 1);
    assert.equal((await getProfile(user.id)).totalXp, 10);
    assert.equal((await getWallet(user.id)).goldBalance, 5);

    // ── 6. Multiple quest completions & progression ───────────────────────────
    // Medium quest (+25 XP, +15 Gold -> totalXp=35, gold=20)
    const medQuest = await prisma.quest.create({ data: { userId: user.id, title: 'Medium quest', priority: 'MEDIUM' } });
    const medResult = await completeQuestWithXp(medQuest.id, user.id);
    assert.equal(medResult.reward.xpAwarded, 25);
    assert.equal(medResult.reward.goldAwarded, 15);
    assert.equal(medResult.progression.goldBalance, 20);

    // High quest (+50 XP, +30 Gold -> totalXp=85, gold=50)
    const highQuest = await prisma.quest.create({ data: { userId: user.id, title: 'High quest', priority: 'HIGH' } });
    const highResult = await completeQuestWithXp(highQuest.id, user.id);
    assert.equal(highResult.reward.xpAwarded, 50);
    assert.equal(highResult.reward.goldAwarded, 30);
    assert.equal(highResult.progression.goldBalance, 50);

    // Level-up quest (+50 XP, +30 Gold -> totalXp=135, level=2, gold=80)
    const lvlQuest = await prisma.quest.create({ data: { userId: user.id, title: 'Level-up quest', priority: 'HIGH' } });
    const lvlResult = await completeQuestWithXp(lvlQuest.id, user.id);
    assert.equal(lvlResult.reward.xpAwarded, 50);
    assert.equal(lvlResult.reward.goldAwarded, 30);
    assert.equal(lvlResult.progression.levelUp, true);
    assert.equal(lvlResult.progression.newLevel, 2);
    assert.equal(lvlResult.progression.goldBalance, 80);

    const profile = await getProfile(user.id);
    assert.equal(profile.totalXp, 135);
    assert.equal(profile.level, 2);
    assert.equal(profile.goldBalance, 80);

    // ── 7. Gold and XP ledgers / history APIs ─────────────────────────────────
    const xpHistory = await getXpHistory(user.id, 1, 20);
    assert.equal(xpHistory.entries.length, 4);
    assert.ok(xpHistory.entries.every((entry) => entry.reason === 'QUEST_COMPLETION'));

    const goldHistory = await getGoldHistory(user.id, 1, 20);
    assert.equal(goldHistory.items.length, 4);
    assert.equal(goldHistory.pagination.total, 4);
    assert.equal(goldHistory.items[0].balanceAfter, 80);
    assert.equal(goldHistory.items[0].amount, 30);
    assert.equal(goldHistory.items[0].questTitle, 'Level-up quest');
    assert.ok(goldHistory.items.every((item) => item.type === 'QUEST_REWARD'));
    assert.ok(goldHistory.items.every((item) => item.reason === 'QUEST_COMPLETION'));

    // ── 8. Cross-user isolation and ownership ──────────────────────────────────
    const otherQuest = await prisma.quest.create({ data: { userId: otherUser.id, title: 'Private quest', priority: 'HIGH' } });
    await assert.rejects(() => completeQuestWithXp(otherQuest.id, user.id), { message: 'Quest not found' });
    assert.equal(await prisma.xpTransaction.count({ where: { questId: otherQuest.id } }), 0);
    assert.equal(await prisma.goldTransaction.count({ where: { questId: otherQuest.id } }), 0);

    // Other user's wallet is completely separate
    const otherWallet = await getWallet(otherUser.id);
    assert.equal(otherWallet.goldBalance, 0);
    const otherGoldHistory = await getGoldHistory(otherUser.id, 1, 20);
    assert.equal(otherGoldHistory.items.length, 0);
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: [user.id, otherUser.id] } } });
  }
});
