import prisma from '../config/database';
import {
  Prisma,
  QuestStatus,
  QuestDifficulty,
  XpReason,
  GoldTransactionType,
  GoldReason,
  NotificationType,
  LogAction,
} from '@prisma/client';
import { getLevelProgress } from '../utils/rpg';
import { getOrCreateProfile } from './rpg.service';
import { recordProductiveDay } from './streak.service';
import { checkAndUnlockAchievements } from './achievement.service';
import { createNotification } from './notification.service';
import { realtimeService } from './realtime.service';

export const DAILY_TEMPLATES = [
  {
    code: 'MORNING_RITUAL',
    title: 'Morning Intent & Planning',
    description: 'Set your primary objectives and plan your focus sessions for the day.',
    difficulty: QuestDifficulty.EASY,
    xpReward: 30,
    goldReward: 15,
  },
  {
    code: 'DEEP_FOCUS',
    title: 'Deep Focus Sprint',
    description: 'Complete a 45-minute focused session free of all interruptions.',
    difficulty: QuestDifficulty.MEDIUM,
    xpReward: 45,
    goldReward: 25,
  },
  {
    code: 'PHYSICAL_VITALITY',
    title: 'Physical Vitality Routine',
    description: 'Engage in 20 minutes of exercise, stretching, or a refreshing brisk walk.',
    difficulty: QuestDifficulty.EASY,
    xpReward: 30,
    goldReward: 15,
  },
];

export const generateDailyQuests = async (
  userId: string,
  dateStr?: string,
  tx?: Prisma.TransactionClient
) => {
  const client = tx || prisma;
  const targetDate = dateStr || new Date().toISOString().slice(0, 10);

  const existing = await client.dailyQuest.findMany({
    where: { userId, date: targetDate },
    orderBy: { createdAt: 'asc' },
  });

  const existingCodes = new Set(existing.map((q) => q.code));
  const missingTemplates = DAILY_TEMPLATES.filter((t) => !existingCodes.has(t.code));

  if (missingTemplates.length > 0) {
    for (const t of missingTemplates) {
      await client.dailyQuest.upsert({
        where: {
          userId_date_code: {
            userId,
            date: targetDate,
            code: t.code,
          },
        },
        create: {
          userId,
          date: targetDate,
          code: t.code,
          title: t.title,
          description: t.description,
          difficulty: t.difficulty,
          xpReward: t.xpReward,
          goldReward: t.goldReward,
          status: QuestStatus.TODO,
        },
        update: {},
      });
    }
  }

  return client.dailyQuest.findMany({
    where: { userId, date: targetDate },
    orderBy: { createdAt: 'asc' },
  });
};

export const getDailyQuests = async (userId: string, dateStr?: string) => {
  return generateDailyQuests(userId, dateStr);
};

export const completeDailyQuest = async (userId: string, dailyQuestId: string) => {
  const runCompletion = () =>
    prisma.$transaction(
      async (tx) => {
        const quest = await tx.dailyQuest.findFirst({
          where: { id: dailyQuestId, userId },
        });

        if (!quest) {
          const err = new Error('Daily quest not found') as Error & { statusCode: number };
          err.statusCode = 404;
          throw err;
        }

        const profile = await tx.playerProfile.upsert({
          where: { userId },
          create: {
            userId,
            totalXp: 0,
            level: 1,
            goldBalance: 0,
            strength: 1,
            intelligence: 1,
            discipline: 1,
            stamina: 1,
            consistency: 1,
            currentStreak: 0,
            longestStreak: 0,
            lastProductiveDate: null,
          },
          update: {},
        });

        if (quest.status === QuestStatus.COMPLETED) {
          const progress = getLevelProgress(profile.totalXp);
          return {
            dailyQuest: quest,
            reward: { xpAwarded: 0, goldAwarded: 0, reason: 'DAILY_QUEST_COMPLETION' },
            progression: {
              previousLevel: profile.level,
              newLevel: profile.level,
              ...progress,
              goldBalance: profile.goldBalance,
              levelUp: false,
            },
            duplicateCompletion: true,
          };
        }

        // Complete daily quest
        const updatedDailyQuest = await tx.dailyQuest.update({
          where: { id: dailyQuestId },
          data: {
            status: QuestStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        const xpAwarded = quest.xpReward;
        const goldAwarded = quest.goldReward;

        // Create XP transaction
        await tx.xpTransaction.create({
          data: {
            userId,
            amount: xpAwarded,
            reason: XpReason.DAILY_QUEST_COMPLETION,
          },
        });

        const newGoldBalance = profile.goldBalance + goldAwarded;

        // Create Gold transaction
        await tx.goldTransaction.create({
          data: {
            userId,
            amount: goldAwarded,
            balanceAfter: newGoldBalance,
            type: GoldTransactionType.QUEST_REWARD,
            reason: GoldReason.DAILY_QUEST_COMPLETION,
          },
        });

        const newTotalXp = profile.totalXp + xpAwarded;
        const newProgress = getLevelProgress(newTotalXp);

        await tx.playerProfile.update({
          where: { userId },
          data: {
            totalXp: newTotalXp,
            level: newProgress.level,
            goldBalance: newGoldBalance,
          },
        });

        // Record streak
        const streakResult = await recordProductiveDay(userId, tx, quest.date);

        // Send notification
        await createNotification(
          userId,
          NotificationType.DAILY_QUEST,
          `📜 Daily Mission Fulfilled: ${quest.title}`,
          `You completed your daily objective! (+${xpAwarded} XP, +${goldAwarded} Gold)`,
          { dailyQuestId: quest.id, xpAwarded, goldAwarded },
          tx
        );

        // Record activity log
        await tx.activityLog.create({
          data: {
            userId,
            action: LogAction.DAILY_QUEST_COMPLETED,
            metadata: { dailyQuestId: quest.id, title: quest.title },
          },
        });

        return {
          dailyQuest: updatedDailyQuest,
          reward: { xpAwarded, goldAwarded, reason: 'DAILY_QUEST_COMPLETION' },
          progression: {
            previousLevel: profile.level,
            newLevel: newProgress.level,
            ...newProgress,
            goldBalance: newGoldBalance,
            levelUp: newProgress.level > profile.level,
          },
          streak: streakResult,
          unlockedAchievements: [] as Awaited<ReturnType<typeof checkAndUnlockAchievements>>,
          duplicateCompletion: false,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

  let result;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      result = await runCompletion();
      break;
    } catch (error) {
      if ((error as { code?: string }).code !== 'P2034' || attempt === 2) throw error;
    }
  }

  if (!result) throw new Error('Daily quest completion could not be finalized');

  if (!result.duplicateCompletion) {
    const unlocked = await checkAndUnlockAchievements(userId).catch(() => []);
    result.unlockedAchievements = unlocked;

    realtimeService.emitUserEvent(userId, 'DAILY_QUEST_COMPLETED', {
      dailyQuestId,
      reward: result.reward,
      progression: result.progression,
      streak: result.streak,
    });
    realtimeService.emitUserEvent(userId, 'XP_GAINED', {
      amount: result.reward.xpAwarded,
      totalXp: result.progression.totalXp,
      goldBalance: result.progression.goldBalance,
    });
    realtimeService.emitUserEvent(userId, 'GOLD_GAINED', {
      amount: result.reward.goldAwarded,
      goldBalance: result.progression.goldBalance,
    });
    if (result.progression.levelUp) {
      realtimeService.emitUserEvent(userId, 'LEVEL_UP', {
        newLevel: result.progression.newLevel,
      });
    }
  }

  return result;
};
