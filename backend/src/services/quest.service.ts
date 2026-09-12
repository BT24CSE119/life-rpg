import { z } from 'zod';
import prisma from '../config/database';
import { Prisma, QuestStatus, QuestPriority, XpReason, GoldTransactionType, GoldReason, NotificationType } from '@prisma/client';
import { calculateQuestXp, calculateQuestGold, getLevelProgress } from '../utils/rpg';
import { DEFAULT_PROFILE, PROFILE_SELECT } from './rpg.service';
import { recordProductiveDay } from './streak.service';
import { checkAndUnlockAchievements } from './achievement.service';
import { createNotification } from './notification.service';
import { realtimeService } from './realtime.service';

// ── Validation Schemas ────────────────────────────────────────────────────────

export const createQuestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be at most 1000 characters')
    .optional(),
  priority: z
    .nativeEnum(QuestPriority)
    .default(QuestPriority.MEDIUM),
  dueDate: z
    .string()
    .datetime({ message: 'Invalid date format. Use ISO 8601.' })
    .optional()
    .nullable(),
  // Silently ignore any client-provided reward/XP/ownership fields
}).strip();

export const updateQuestSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(100, 'Title must be at most 100 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Description must be at most 1000 characters')
      .optional()
      .nullable(),
    priority: z.nativeEnum(QuestPriority).optional(),
    // Completion must always flow through POST /:id/complete so the reward
    // ledger and player profile are updated together in one transaction.
    status: z
      .enum([
        QuestStatus.TODO,
        QuestStatus.IN_PROGRESS,
        QuestStatus.ACTIVE,
        QuestStatus.FAILED,
        QuestStatus.ABANDONED,
      ])
      .optional(),
    dueDate: z
      .string()
      .datetime({ message: 'Invalid date format. Use ISO 8601.' })
      .optional()
      .nullable(),
  })
  .strip()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Update body cannot be empty',
  });

// ── Safe Quest Select ─────────────────────────────────────────────────────────

const QUEST_SELECT = {
  id: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  dueDate: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

const notFoundError = (msg = 'Quest not found') => {
  const err = new Error(msg) as Error & { statusCode: number };
  err.statusCode = 404;
  return err;
};

const forbiddenError = () => {
  const err = new Error('Quest not found') as Error & { statusCode: number };
  // Return 404 (not 403) — never reveal existence of another user's quest
  err.statusCode = 404;
  return err;
};

// ── Service Functions ─────────────────────────────────────────────────────────

/**
 * Get all quests for the authenticated user.
 * - Supports optional status / priority filters
 * - Sort: active first, then by dueDate asc, then by createdAt desc
 */
export const getQuests = async (
  userId: string,
  filters: { status?: QuestStatus; priority?: QuestPriority }
) => {
  const where = {
    userId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
  };

  return prisma.quest.findMany({
    where,
    select: QUEST_SELECT,
    orderBy: [
      // Completed quests last
      { status: 'asc' },
      // Then sort by dueDate ascending (nulls last)
      { dueDate: 'asc' },
      // Then newest first
      { createdAt: 'desc' },
    ],
  });
};

/**
 * Get a single quest by ID — enforces ownership.
 */
export const getQuestById = async (questId: string, userId: string) => {
  const quest = await prisma.quest.findFirst({
    where: { id: questId, userId },
    select: QUEST_SELECT,
  });

  if (!quest) throw notFoundError();

  return quest;
};

/**
 * Create a new quest owned by the authenticated user.
 * Never trusts userId / XP / gold from the client.
 */
export const createQuest = async (
  userId: string,
  data: z.output<typeof createQuestSchema>
) => {
  return prisma.quest.create({
    data: {
      userId,                                   // Always from JWT — never client
      title: data.title,
      description: data.description ?? null,
      priority: data.priority,
      status: QuestStatus.TODO,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      // xpReward / goldReward stay at schema defaults — never from client
    },
    select: QUEST_SELECT,
  });
};

/**
 * Update an existing quest — enforces ownership.
 * Completion is deliberately excluded here. Use completeQuestWithXp so a
 * completed quest cannot exist without its server-authoritative XP record.
 */
export const updateQuest = async (
  questId: string,
  userId: string,
  data: z.output<typeof updateQuestSchema>
) => {
  // Verify existence and ownership
  const existing = await prisma.quest.findFirst({
    where: { id: questId, userId },
    select: { status: true },
  });

  if (!existing) throw notFoundError();

  if (existing.status === QuestStatus.COMPLETED && data.status !== undefined) {
    const err = new Error('Completed quests cannot be moved to another status') as Error & { statusCode: number };
    err.statusCode = 409;
    throw err;
  }

  return prisma.quest.update({
    where: { id: questId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.dueDate !== undefined
        ? { dueDate: data.dueDate ? new Date(data.dueDate) : null }
        : {}),
    },
    select: QUEST_SELECT,
  });
};

/**
 * Delete a quest — enforces ownership.
 */
export const deleteQuest = async (questId: string, userId: string) => {
  const existing = await prisma.quest.findFirst({
    where: { id: questId, userId },
    select: { id: true },
  });

  if (!existing) throw notFoundError();

  await prisma.quest.delete({ where: { id: questId } });
};

/**
 * Mark a quest as COMPLETED.
 * - Idempotent: completing an already-completed quest is a no-op
 * - No XP / gold / level calculation in Phase 3
 */
export const completeQuest = async (questId: string, userId: string) => {
  const existing = await prisma.quest.findFirst({
    where: { id: questId, userId },
    select: { status: true },
  });

  if (!existing) throw notFoundError();

  // Already completed — return idempotently without creating duplicate records
  if (existing.status === QuestStatus.COMPLETED) {
    return prisma.quest.findUnique({
      where: { id: questId },
      select: QUEST_SELECT,
    });
  }

  return prisma.quest.update({
    where: { id: questId },
    data: {
      status: QuestStatus.COMPLETED,
      completedAt: new Date(),
    },
    select: QUEST_SELECT,
  });
};

export const completeQuestWithXp = async (questId: string, userId: string) => {
  const runCompletion = () => prisma.$transaction(async (tx) => {
    const existing = await tx.quest.findFirst({
      where: { id: questId, userId },
      select: { priority: true },
    });
    if (!existing) throw notFoundError();

    const profile = await tx.playerProfile.upsert({
      where: { userId }, create: { userId, ...DEFAULT_PROFILE }, update: {}, select: PROFILE_SELECT,
    });
    const completed = await tx.quest.updateMany({
      where: { id: questId, userId, status: { not: QuestStatus.COMPLETED } },
      data: { status: QuestStatus.COMPLETED, completedAt: new Date() },
    });

    if (completed.count === 0) {
      const quest = await tx.quest.findFirst({ where: { id: questId, userId }, select: QUEST_SELECT });
      if (!quest) throw notFoundError();
      const progress = getLevelProgress(profile.totalXp);
      return {
        quest,
        reward: { xpAwarded: 0, goldAwarded: 0, reason: XpReason.QUEST_COMPLETION },
        rewards: { xp: 0, gold: 0 },
        progression: {
          previousLevel: profile.level,
          newLevel: profile.level,
          ...progress,
          goldBalance: profile.goldBalance,
          levelUp: false,
        },
        rpg: {
          level: profile.level,
          totalXp: profile.totalXp,
          currentXp: progress.currentLevelXp,
          goldBalance: profile.goldBalance,
          leveledUp: false,
        },
        duplicateCompletion: true,
      };
    }

    const xpAwarded = calculateQuestXp(existing.priority);
    const goldAwarded = calculateQuestGold(existing.priority);

    await tx.xpTransaction.create({
      data: { userId, questId, amount: xpAwarded, reason: XpReason.QUEST_COMPLETION },
    });

    const newGoldBalance = profile.goldBalance + goldAwarded;

    await tx.goldTransaction.create({
      data: {
        userId,
        questId,
        amount: goldAwarded,
        balanceAfter: newGoldBalance,
        type: GoldTransactionType.QUEST_REWARD,
        reason: GoldReason.QUEST_COMPLETION,
      },
    });

    const totalXp = profile.totalXp + xpAwarded;
    const calculated = getLevelProgress(totalXp);
    const updatedProfile = await tx.playerProfile.update({
      where: { userId },
      data: {
        totalXp,
        level: calculated.level,
        goldBalance: newGoldBalance,
      },
      select: PROFILE_SELECT,
    });

    // Record streak for today
    await recordProductiveDay(userId, tx);

    const quest = await tx.quest.findUniqueOrThrow({ where: { id: questId }, select: QUEST_SELECT });

    // Send quest completed notification
    await createNotification(
      userId,
      NotificationType.QUEST_COMPLETED,
      `⚔️ Quest Fulfilled: ${quest.title}`,
      `You completed ${quest.title}! (+${xpAwarded} XP, +${goldAwarded} Gold)`,
      { questId: quest.id, xpAwarded, goldAwarded },
      tx
    );

    return {
      quest,
      reward: { xpAwarded, goldAwarded, reason: XpReason.QUEST_COMPLETION },
      rewards: { xp: xpAwarded, gold: goldAwarded },
      progression: {
        previousLevel: profile.level,
        newLevel: updatedProfile.level,
        ...calculated,
        goldBalance: updatedProfile.goldBalance,
        levelUp: updatedProfile.level > profile.level,
      },
      rpg: {
        level: updatedProfile.level,
        totalXp: updatedProfile.totalXp,
        currentXp: calculated.currentLevelXp,
        goldBalance: updatedProfile.goldBalance,
        leveledUp: updatedProfile.level > profile.level,
      },
      duplicateCompletion: false,
    };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const outcome = await runCompletion();
      if (!outcome.duplicateCompletion) {
        realtimeService.emitUserEvent(userId, 'QUEST_COMPLETED', {
          questId,
          reward: outcome.reward,
          progression: outcome.progression,
        });
        realtimeService.emitUserEvent(userId, 'XP_GAINED', {
          amount: outcome.reward.xpAwarded,
          totalXp: outcome.progression.totalXp,
          goldBalance: outcome.progression.goldBalance,
        });
        realtimeService.emitUserEvent(userId, 'GOLD_GAINED', {
          amount: outcome.reward.goldAwarded,
          goldBalance: outcome.progression.goldBalance,
        });
        if (outcome.progression.levelUp) {
          realtimeService.emitUserEvent(userId, 'LEVEL_UP', {
            newLevel: outcome.progression.newLevel,
          });
        }
      }
      return outcome;
    } catch (error) {
      const err = error as { code?: string; message?: string };
      const isConflict =
        err.code === 'P2034' ||
        err.code === 'P2028' ||
        err.message?.includes('write conflict') ||
        err.message?.includes('deadlock');
      if (!isConflict || attempt === 4) throw error;
      await new Promise((r) => setTimeout(r, 20 * (attempt + 1)));
    }
  }
  throw new Error('Quest completion could not be finalized');
};

export const completeQuestWithRewards = completeQuestWithXp;
