import test from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/config/database';
import { generateDailyQuests, completeDailyQuest } from '../src/services/dailyQuest.service';
import { recordProductiveDay, getStreak } from '../src/services/streak.service';
import { getAchievements, checkAndUnlockAchievements } from '../src/services/achievement.service';
import { getShopItems, purchaseItem } from '../src/services/shop.service';
import { getUserInventory, equipItem, unequipItem } from '../src/services/inventory.service';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } from '../src/services/notification.service';
import { getDashboardForUser } from '../src/services/dashboard.service';
import { createQuest, completeQuestWithRewards } from '../src/services/quest.service';
import { QuestPriority } from '@prisma/client';

test('Phase 8 Advanced RPG Features integration test suite', async (t) => {
  const testSuffix = Date.now().toString().slice(-6);
  const userA = await prisma.user.create({
    data: {
      username: `adventurer_a_${testSuffix}`,
      email: `adventurer_a_${testSuffix}@example.com`,
      passwordHash: 'dummy_hash',
    },
  });

  const userB = await prisma.user.create({
    data: {
      username: `adventurer_b_${testSuffix}`,
      email: `adventurer_b_${testSuffix}@example.com`,
      passwordHash: 'dummy_hash',
    },
  });

  t.after(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } },
    });
  });

  await t.test('Daily Quests: Generation and Duplicate Prevention', async () => {
    const today = '2026-09-12';
    const quests1 = await generateDailyQuests(userA.id, today);
    assert.equal(quests1.length, 3, 'Should generate 3 daily missions');

    const quests2 = await generateDailyQuests(userA.id, today);
    assert.equal(quests2.length, 3, 'Duplicate generation call must return same 3 missions');
    assert.equal(quests1[0].id, quests2[0].id, 'IDs must match existing records');
  });

  await t.test('Daily Quests: Atomic Completion & Duplicate Protection', async () => {
    const today = '2026-09-12';
    const quests = await generateDailyQuests(userA.id, today);
    const targetQuest = quests[0];

    const result = await completeDailyQuest(userA.id, targetQuest.id);
    assert.equal(result.duplicateCompletion, false);
    assert.equal(result.dailyQuest.status, 'COMPLETED');
    assert.ok(result.reward.xpAwarded > 0, 'Must award positive XP');
    assert.ok(result.reward.goldAwarded > 0, 'Must award positive Gold');
    assert.equal(result.progression.goldBalance, result.reward.goldAwarded);

    // Test duplicate completion protection
    const dupResult = await completeDailyQuest(userA.id, targetQuest.id);
    assert.equal(dupResult.duplicateCompletion, true);
    assert.equal(dupResult.reward.xpAwarded, 0);
    assert.equal(dupResult.reward.goldAwarded, 0);

    // Cross-user access protection
    await assert.rejects(
      async () => completeDailyQuest(userB.id, targetQuest.id),
      /not found/i,
      'User B must not be able to complete User A daily quest'
    );
  });

  await t.test('Productivity Streak: Consecutive days and milestone tracking', async () => {
    // Today already recorded from daily quest completion above
    const streakToday = await getStreak(userA.id);
    assert.equal(streakToday.currentStreak, 1, 'Current streak should be 1');

    // Simulate consecutive day tomorrow
    const tomorrowStr = '2026-09-13';
    const streakTomorrow = await recordProductiveDay(userA.id, undefined, tomorrowStr);
    assert.equal(streakTomorrow.currentStreak, 2, 'Consecutive day should increment streak to 2');

    // Same day call should not increment
    const streakDup = await recordProductiveDay(userA.id, undefined, tomorrowStr);
    assert.equal(streakDup.currentStreak, 2, 'Same-day call must not increment streak');

    // Day 3 milestone test
    const day3Str = '2026-09-14';
    const streakDay3 = await recordProductiveDay(userA.id, undefined, day3Str);
    assert.equal(streakDay3.currentStreak, 3, 'Streak should reach 3 days');
  });

  await t.test('Achievements: Unlock, Ledger Record, and Idempotency', async () => {
    // User A has completed a daily quest and reached streak 3, unlocking achievements
    const unlocked = await checkAndUnlockAchievements(userA.id);
    // User A should have unlocked STREAK_3 and DAILY_QUEST_HERO
    const achData = await getAchievements(userA.id);
    assert.ok(achData.unlockedCount >= 2, 'Should have unlocked at least 2 achievements');

    const streakAch = achData.achievements.find((a) => a.code === 'STREAK_3');
    assert.ok(streakAch, 'STREAK_3 achievement should exist');
    assert.equal(streakAch?.isUnlocked, true, 'STREAK_3 should be unlocked');

    // Repeat check should be idempotent
    const rerun = await checkAndUnlockAchievements(userA.id);
    assert.equal(rerun.length, 0, 'No new achievements should be unlocked on re-check');
  });

  await t.test('Guild Shop: Catalogue, Balance Check & Purchase Safety', async () => {
    const shop = await getShopItems(userA.id);
    assert.ok(shop.items.length >= 4, 'Shop should have catalog items');

    const cheapestItem = shop.items[0]; // Usually around 20-30 Gold
    // Verify User A has enough Gold from quests & achievements
    assert.ok(shop.userGoldBalance >= cheapestItem.goldCost, 'User A should have accumulated gold');

    const initialGold = shop.userGoldBalance;
    const purchaseResult = await purchaseItem(userA.id, cheapestItem.id);
    assert.equal(purchaseResult.newGoldBalance, initialGold - cheapestItem.goldCost);
    assert.equal(purchaseResult.inventory.itemId, cheapestItem.id);
    assert.equal(purchaseResult.inventory.quantity, 1);

    // Insufficient Gold Test with User B (0 Gold)
    await assert.rejects(
      async () => purchaseItem(userB.id, cheapestItem.id),
      /insufficient/i,
      'User with 0 gold must be rejected with insufficient gold error'
    );
  });

  await t.test('Inventory & Equipment: Equip and Unequip Customization', async () => {
    const inventory = await getUserInventory(userA.id);
    assert.ok(inventory.length >= 1, 'User A should have purchased item in inventory');

    const ownedItem = inventory[0];
    const equipResult = await equipItem(userA.id, ownedItem.itemId);
    assert.equal(equipResult.isEquipped, true, 'Item should now be equipped');

    // Unequip
    const unequipResult = await unequipItem(userA.id, ownedItem.itemId);
    assert.equal(unequipResult.isEquipped, false, 'Item should now be unequipped');

    // User B cannot equip User A item
    await assert.rejects(
      async () => equipItem(userB.id, ownedItem.itemId),
      /do not own/i,
      'User B cannot equip unowned item'
    );
  });

  await t.test('Notifications: Event generation and Read management', async () => {
    const notifs = await getNotifications(userA.id);
    assert.ok(notifs.items.length >= 2, 'Should have generated notifications from quest/shop/streak');

    const unread = await getUnreadNotificationCount(userA.id);
    assert.ok(unread.unreadCount > 0, 'Should have unread notifications');

    // Mark single notification as read
    const firstNotif = notifs.items[0];
    const marked = await markNotificationAsRead(userA.id, firstNotif.id);
    assert.equal(marked.isRead, true);

    // Mark all as read
    const markAll = await markAllNotificationsAsRead(userA.id);
    assert.ok(markAll.updatedCount >= 0);

    const postUnread = await getUnreadNotificationCount(userA.id);
    assert.equal(postUnread.unreadCount, 0, 'All notifications should now be read');
  });

  await t.test('Consolidated Dashboard: Delivers enriched Phase 8 payload', async () => {
    const dashboard = await getDashboardForUser(userA.id);
    assert.ok(dashboard.player, 'Player profile must be present');
    assert.ok(dashboard.streak, 'Streak data must be present');
    assert.ok(dashboard.dailyQuests.length > 0, 'Daily quests must be present');
    assert.ok(dashboard.achievements.totalCount > 0, 'Achievements summary must be present');
    assert.equal(typeof dashboard.inventoryCount, 'number');
    assert.equal(typeof dashboard.unreadNotificationsCount, 'number');
  });
});
