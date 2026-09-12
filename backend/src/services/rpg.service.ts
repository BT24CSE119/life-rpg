import { Prisma, XpReason } from '@prisma/client';
import prisma from '../config/database';
import { getLevelProgress } from '../utils/rpg';

const PROFILE_SELECT = {
  userId: true,
  totalXp: true,
  level: true,
  goldBalance: true,
  strength: true,
  intelligence: true,
  discipline: true,
  stamina: true,
  consistency: true,
} as const;

const DEFAULT_PROFILE = {
  totalXp: 0,
  level: 1,
  goldBalance: 0,
  strength: 1,
  intelligence: 1,
  discipline: 1,
  stamina: 1,
  consistency: 1,
};

export const getOrCreateProfile = async (userId: string) =>
  prisma.playerProfile.upsert({
    where: { userId },
    create: { userId, ...DEFAULT_PROFILE },
    update: {},
    select: PROFILE_SELECT,
  });

export const toProfileResponse = (profile: Awaited<ReturnType<typeof getOrCreateProfile>>) => {
  const progress = getLevelProgress(profile.totalXp);
  return {
    userId: profile.userId,
    ...progress,
    goldBalance: profile.goldBalance,
    attributes: {
      strength: profile.strength,
      intelligence: profile.intelligence,
      discipline: profile.discipline,
      stamina: profile.stamina,
      consistency: profile.consistency,
    },
  };
};

export const getProfile = async (userId: string) => toProfileResponse(await getOrCreateProfile(userId));

export const getXpHistory = async (userId: string, page: number, limit: number) => {
  const [transactions, total] = await Promise.all([
    prisma.xpTransaction.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        reason: true,
        questId: true,
        createdAt: true,
        quest: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.xpTransaction.count({ where: { userId } }),
  ]);

  return {
    entries: transactions.map(({ quest, ...transaction }) => ({
      ...transaction,
      questTitle: quest.title,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getWallet = async (userId: string) => {
  const profile = await getOrCreateProfile(userId);
  return { goldBalance: profile.goldBalance };
};

export const getGoldHistory = async (userId: string, page: number, limit: number) => {
  const [transactions, total] = await Promise.all([
    prisma.goldTransaction.findMany({
      where: { userId },
      select: {
        id: true, amount: true, balanceAfter: true, type: true, reason: true,
        questId: true, createdAt: true, quest: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.goldTransaction.count({ where: { userId } }),
  ]);

  return {
    items: transactions.map(({ quest, ...transaction }) => ({
      ...transaction,
      questTitle: quest?.title ?? null,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getStats = async (userId: string) => {
  const [profile, completedQuests, totalQuests] = await Promise.all([
    getProfile(userId),
    prisma.quest.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.quest.count({ where: { userId } }),
  ]);

  return { ...profile, completedQuests, totalQuests };
};

export type RpgTransactionClient = Prisma.TransactionClient;
export { DEFAULT_PROFILE, PROFILE_SELECT, XpReason };
