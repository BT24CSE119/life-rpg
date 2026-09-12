import prisma from '../config/database';
import { QuestStatus } from '@prisma/client';
import { calculateQuestGold, calculateQuestXp, getLevelProgress } from '../utils/rpg';
import { getOrCreateProfile } from './rpg.service';

export interface DashboardActivity {
  id: string;
  type: 'QUEST_COMPLETED' | 'XP_EARNED' | 'GOLD_EARNED';
  title: string;
  amount?: number;
  balanceAfter?: number;
  timestamp: Date;
  icon: string;
}

export const getDashboardForUser = async (userId: string) => {
  const [
    user,
    profile,
    totalQuests,
    todoQuests,
    inProgressQuests,
    completedQuests,
    rawActiveQuests,
    rawRecentlyCompleted,
    xpTransactions,
    goldTransactions,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, email: true },
    }),
    getOrCreateProfile(userId),
    prisma.quest.count({ where: { userId } }),
    prisma.quest.count({ where: { userId, status: QuestStatus.TODO } }),
    prisma.quest.count({
      where: {
        userId,
        status: { in: [QuestStatus.IN_PROGRESS, QuestStatus.ACTIVE] },
      },
    }),
    prisma.quest.count({ where: { userId, status: QuestStatus.COMPLETED } }),
    prisma.quest.findMany({
      where: {
        userId,
        status: { in: [QuestStatus.TODO, QuestStatus.IN_PROGRESS, QuestStatus.ACTIVE] },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        createdAt: true,
      },
    }),
    prisma.quest.findMany({
      where: { userId, status: QuestStatus.COMPLETED },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        completedAt: true,
        createdAt: true,
      },
    }),
    prisma.xpTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        reason: true,
        createdAt: true,
        quest: { select: { title: true } },
      },
    }),
    prisma.goldTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        balanceAfter: true,
        type: true,
        reason: true,
        createdAt: true,
        quest: { select: { title: true } },
      },
    }),
  ]);

  if (!user) {
    const error = new Error('User not found') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const levelProgress = getLevelProgress(profile.totalXp);
  const completionPercentage =
    totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  const activeQuests = rawActiveQuests.map((q) => ({
    ...q,
    xpReward: calculateQuestXp(q.priority),
    goldReward: calculateQuestGold(q.priority),
  }));

  const recentlyCompletedQuests = rawRecentlyCompleted.map((q) => ({
    ...q,
    xpReward: calculateQuestXp(q.priority),
    goldReward: calculateQuestGold(q.priority),
  }));

  const recentXpHistory = xpTransactions.map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    reason: tx.reason,
    createdAt: tx.createdAt,
    questTitle: tx.quest?.title ?? null,
  }));

  const recentGoldHistory = goldTransactions.map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    balanceAfter: tx.balanceAfter,
    type: tx.type,
    reason: tx.reason,
    createdAt: tx.createdAt,
    questTitle: tx.quest?.title ?? null,
  }));

  // Build unified recent activities
  const activities: DashboardActivity[] = [];

  for (const q of rawRecentlyCompleted) {
    if (q.completedAt) {
      activities.push({
        id: `quest-${q.id}`,
        type: 'QUEST_COMPLETED',
        title: `Completed: ${q.title}`,
        timestamp: q.completedAt,
        icon: '✅',
      });
    }
  }

  for (const xp of xpTransactions) {
    activities.push({
      id: `xp-${xp.id}`,
      type: 'XP_EARNED',
      title: xp.quest?.title ? `+${xp.amount} XP from ${xp.quest.title}` : `+${xp.amount} XP earned`,
      amount: xp.amount,
      timestamp: xp.createdAt,
      icon: '✨',
    });
  }

  for (const gold of goldTransactions) {
    activities.push({
      id: `gold-${gold.id}`,
      type: 'GOLD_EARNED',
      title: gold.quest?.title ? `+${gold.amount} Gold from ${gold.quest.title}` : `+${gold.amount} Gold earned`,
      amount: gold.amount,
      balanceAfter: gold.balanceAfter,
      timestamp: gold.createdAt,
      icon: '🪙',
    });
  }

  // Sort activities newest first and limit to 10
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const recentActivity = activities.slice(0, 10);

  return {
    player: {
      name: user.username,
      email: user.email,
      level: levelProgress.level,
      totalXp: levelProgress.totalXp,
      currentXp: levelProgress.currentLevelXp,
      xpForNextLevel: levelProgress.nextLevelXp,
      xpProgressPercentage: levelProgress.progressPercent,
      goldBalance: profile.goldBalance,
    },
    attributes: {
      strength: profile.strength,
      intelligence: profile.intelligence,
      discipline: profile.discipline,
      stamina: profile.stamina,
      consistency: profile.consistency,
    },
    quests: {
      total: totalQuests,
      todo: todoQuests,
      inProgress: inProgressQuests,
      active: todoQuests + inProgressQuests,
      completed: completedQuests,
      completionPercentage,
    },
    activeQuests,
    recentlyCompletedQuests,
    recentXpHistory,
    recentGoldHistory,
    recentActivity,
  };
};
