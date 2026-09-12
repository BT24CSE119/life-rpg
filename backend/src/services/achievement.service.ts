import prisma from '../config/database';
import {
  Prisma,
  ItemRarity,
  XpReason,
  GoldTransactionType,
  GoldReason,
  NotificationType,
  LogAction,
  QuestStatus,
} from '@prisma/client';
import { getLevelProgress } from '../utils/rpg';
import { createNotification } from './notification.service';

export const INITIAL_ACHIEVEMENTS = [
  {
    code: 'FIRST_QUEST',
    title: 'First Blood',
    description: 'Complete your very first quest in the realm.',
    category: 'QUESTS',
    rarity: ItemRarity.COMMON,
    xpReward: 50,
    goldReward: 25,
    iconEmoji: '⚔️',
  },
  {
    code: 'QUEST_MASTER_10',
    title: 'Tenacious Warrior',
    description: 'Complete 10 total quests.',
    category: 'QUESTS',
    rarity: ItemRarity.UNCOMMON,
    xpReward: 100,
    goldReward: 50,
    iconEmoji: '🛡️',
  },
  {
    code: 'QUEST_MASTER_50',
    title: 'Veteran Pathfinder',
    description: 'Complete 50 total quests.',
    category: 'QUESTS',
    rarity: ItemRarity.RARE,
    xpReward: 250,
    goldReward: 150,
    iconEmoji: '🗺️',
  },
  {
    code: 'LEVEL_5',
    title: 'Ascendant Novice',
    description: 'Reach Level 5 in Life RPG.',
    category: 'PROGRESSION',
    rarity: ItemRarity.UNCOMMON,
    xpReward: 100,
    goldReward: 50,
    iconEmoji: '🌟',
  },
  {
    code: 'LEVEL_10',
    title: 'Knight of the Citadel',
    description: 'Reach Level 10 in Life RPG.',
    category: 'PROGRESSION',
    rarity: ItemRarity.EPIC,
    xpReward: 300,
    goldReward: 200,
    iconEmoji: '👑',
  },
  {
    code: 'GOLD_COLLECTOR',
    title: 'Gilded Pockets',
    description: 'Accumulate at least 100 Gold in your treasury.',
    category: 'WEALTH',
    rarity: ItemRarity.COMMON,
    xpReward: 50,
    goldReward: 25,
    iconEmoji: '🪙',
  },
  {
    code: 'GOLD_MASTER',
    title: 'High Treasurer',
    description: 'Accumulate at least 500 Gold in your treasury.',
    category: 'WEALTH',
    rarity: ItemRarity.RARE,
    xpReward: 200,
    goldReward: 100,
    iconEmoji: '💰',
  },
  {
    code: 'STREAK_3',
    title: 'Ignition',
    description: 'Maintain a 3-day productivity streak.',
    category: 'STREAKS',
    rarity: ItemRarity.COMMON,
    xpReward: 50,
    goldReward: 30,
    iconEmoji: '🔥',
  },
  {
    code: 'STREAK_7',
    title: 'Iron Will',
    description: 'Maintain a 7-day productivity streak.',
    category: 'STREAKS',
    rarity: ItemRarity.RARE,
    xpReward: 150,
    goldReward: 75,
    iconEmoji: '⚡',
  },
  {
    code: 'DAILY_QUEST_HERO',
    title: 'Daily Dedication',
    description: 'Complete your first daily mission.',
    category: 'DAILY',
    rarity: ItemRarity.COMMON,
    xpReward: 50,
    goldReward: 25,
    iconEmoji: '📜',
  },
];

export const ensureAchievementsSeeded = async () => {
  for (const ach of INITIAL_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      create: ach,
      update: {
        title: ach.title,
        description: ach.description,
        category: ach.category,
        rarity: ach.rarity,
        xpReward: ach.xpReward,
        goldReward: ach.goldReward,
        iconEmoji: ach.iconEmoji,
      },
    });
  }
};

export const checkAndUnlockAchievements = async (
  userId: string,
  tx?: Prisma.TransactionClient
) => {
  const client = tx || prisma;
  await ensureAchievementsSeeded();

  const [allAchievements, userAchievements, profile, completedQuests, completedDaily] =
    await Promise.all([
      client.achievement.findMany(),
      client.userAchievement.findMany({ where: { userId } }),
      client.playerProfile.findUniqueOrThrow({ where: { userId } }),
      client.quest.count({ where: { userId, status: QuestStatus.COMPLETED } }),
      client.dailyQuest.count({ where: { userId, status: QuestStatus.COMPLETED } }),
    ]);

  const unlockedCodeSet = new Set(
    userAchievements.map((ua) => {
      const found = allAchievements.find((a) => a.id === ua.achievementId);
      return found?.code;
    }).filter(Boolean)
  );

  const newlyUnlocked: Array<(typeof allAchievements)[number]> = [];

  for (const ach of allAchievements) {
    if (unlockedCodeSet.has(ach.code)) continue;

    let isEligible = false;
    switch (ach.code) {
      case 'FIRST_QUEST':
        isEligible = completedQuests >= 1;
        break;
      case 'QUEST_MASTER_10':
        isEligible = completedQuests >= 10;
        break;
      case 'QUEST_MASTER_50':
        isEligible = completedQuests >= 50;
        break;
      case 'LEVEL_5':
        isEligible = profile.level >= 5;
        break;
      case 'LEVEL_10':
        isEligible = profile.level >= 10;
        break;
      case 'GOLD_COLLECTOR':
        isEligible = profile.goldBalance >= 100;
        break;
      case 'GOLD_MASTER':
        isEligible = profile.goldBalance >= 500;
        break;
      case 'STREAK_3':
        isEligible = profile.currentStreak >= 3;
        break;
      case 'STREAK_7':
        isEligible = profile.currentStreak >= 7;
        break;
      case 'DAILY_QUEST_HERO':
        isEligible = completedDaily >= 1;
        break;
      default:
        break;
    }

    if (isEligible) {
      newlyUnlocked.push(ach);
    }
  }

  if (newlyUnlocked.length === 0) {
    return [];
  }

  let runningXp = profile.totalXp;
  let runningGold = profile.goldBalance;

  for (const ach of newlyUnlocked) {
    // Idempotent creation
    await client.userAchievement.create({
      data: {
        userId,
        achievementId: ach.id,
      },
    });

    runningXp += ach.xpReward;
    runningGold += ach.goldReward;

    await client.xpTransaction.create({
      data: {
        userId,
        amount: ach.xpReward,
        reason: XpReason.ACHIEVEMENT_UNLOCKED,
      },
    });

    await client.goldTransaction.create({
      data: {
        userId,
        amount: ach.goldReward,
        balanceAfter: runningGold,
        type: GoldTransactionType.BONUS,
        reason: GoldReason.ACHIEVEMENT_UNLOCKED,
      },
    });

    await createNotification(
      userId,
      NotificationType.ACHIEVEMENT_UNLOCKED,
      `🏆 Achievement Unlocked: ${ach.title}!`,
      `${ach.description} (Reward: +${ach.xpReward} XP, +${ach.goldReward} Gold)`,
      { achievementCode: ach.code, xpReward: ach.xpReward, goldReward: ach.goldReward },
      client
    );

    await client.activityLog.create({
      data: {
        userId,
        action: LogAction.ACHIEVEMENT_UNLOCKED,
        metadata: { achievementCode: ach.code, title: ach.title },
      },
    });
  }

  const newProgression = getLevelProgress(runningXp);
  await client.playerProfile.update({
    where: { userId },
    data: {
      totalXp: runningXp,
      level: newProgression.level,
      goldBalance: runningGold,
    },
  });

  return newlyUnlocked;
};

export const getAchievements = async (userId: string, autoUnlock = true) => {
  await ensureAchievementsSeeded();
  if (autoUnlock) {
    await checkAndUnlockAchievements(userId);
  }

  const [allAchievements, userAchievements, profile, completedQuests, completedDaily] =
    await Promise.all([
      prisma.achievement.findMany({
        orderBy: [{ category: 'asc' }, { xpReward: 'asc' }],
      }),
      prisma.userAchievement.findMany({
        where: { userId },
      }),
      prisma.playerProfile.findUnique({
        where: { userId },
      }),
      prisma.quest.count({ where: { userId, status: QuestStatus.COMPLETED } }),
      prisma.dailyQuest.count({ where: { userId, status: QuestStatus.COMPLETED } }),
    ]);

  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  );

  const currentLevel = profile?.level ?? 1;
  const currentGold = profile?.goldBalance ?? 0;
  const currentStreak = profile?.currentStreak ?? 0;

  const items = allAchievements.map((ach) => {
    const isUnlocked = unlockedMap.has(ach.id);
    const unlockedAt = unlockedMap.get(ach.id) || null;

    // Calculate progress fraction
    let currentVal = 0;
    let targetVal = 1;

    switch (ach.code) {
      case 'FIRST_QUEST':
        currentVal = completedQuests;
        targetVal = 1;
        break;
      case 'QUEST_MASTER_10':
        currentVal = completedQuests;
        targetVal = 10;
        break;
      case 'QUEST_MASTER_50':
        currentVal = completedQuests;
        targetVal = 50;
        break;
      case 'LEVEL_5':
        currentVal = currentLevel;
        targetVal = 5;
        break;
      case 'LEVEL_10':
        currentVal = currentLevel;
        targetVal = 10;
        break;
      case 'GOLD_COLLECTOR':
        currentVal = currentGold;
        targetVal = 100;
        break;
      case 'GOLD_MASTER':
        currentVal = currentGold;
        targetVal = 500;
        break;
      case 'STREAK_3':
        currentVal = currentStreak;
        targetVal = 3;
        break;
      case 'STREAK_7':
        currentVal = currentStreak;
        targetVal = 7;
        break;
      case 'DAILY_QUEST_HERO':
        currentVal = completedDaily;
        targetVal = 1;
        break;
      default:
        currentVal = isUnlocked ? 1 : 0;
        targetVal = 1;
        break;
    }

    const progressPercentage = Math.min(100, Math.round((currentVal / targetVal) * 100));

    return {
      ...ach,
      isUnlocked,
      unlockedAt,
      progress: {
        current: currentVal,
        target: targetVal,
        percentage: progressPercentage,
      },
    };
  });

  const unlockedCount = items.filter((i) => i.isUnlocked).length;

  return {
    totalCount: items.length,
    unlockedCount,
    achievements: items,
  };
};

export const getUnlockedAchievements = async (userId: string) => {
  const result = await getAchievements(userId);
  return result.achievements.filter((a) => a.isUnlocked);
};
