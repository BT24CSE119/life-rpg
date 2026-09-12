import prisma from '../config/database';
import { Prisma, LogAction, NotificationType } from '@prisma/client';
import { getOrCreateProfile } from './rpg.service';
import { createNotification } from './notification.service';

const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 100];

const getNextMilestone = (current: number): number => {
  for (const m of STREAK_MILESTONES) {
    if (current < m) return m;
  }
  return current + 10;
};

const getStreakMotivation = (current: number): string => {
  if (current >= 30) return 'Your streak is legendary! The entire realm speaks of your relentless focus.';
  if (current >= 14) return 'Two solid weeks of greatness! You are forging iron habits.';
  if (current >= 7) return 'One week strong! Momentum is building with unstoppable force.';
  if (current >= 3) return 'Three days in a row! The spark is becoming a blazing flame.';
  if (current >= 1) return 'The journey of a thousand leagues starts with today. Keep the fire burning!';
  return 'Complete any quest today to spark your productivity streak!';
};

export const recordProductiveDay = async (
  userId: string,
  tx?: Prisma.TransactionClient,
  customDateStr?: string
) => {
  const client = tx || prisma;
  const profile = await client.playerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    await getOrCreateProfile(userId);
  }

  const currentProfile = profile || (await client.playerProfile.findUniqueOrThrow({ where: { userId } }));
  const todayStr = customDateStr || new Date().toISOString().slice(0, 10);
  const lastStr = currentProfile.lastProductiveDate;

  if (lastStr === todayStr) {
    return {
      currentStreak: currentProfile.currentStreak,
      longestStreak: currentProfile.longestStreak,
      lastProductiveDate: todayStr,
      incremented: false,
    };
  }

  let newStreak = 1;
  if (lastStr) {
    const lastDate = new Date(`${lastStr}T00:00:00.000Z`);
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak = currentProfile.currentStreak + 1;
    } else if (diffDays <= 0) {
      newStreak = currentProfile.currentStreak;
    } else {
      // Missed at least one day
      newStreak = 1;
    }
  }

  const newLongest = Math.max(currentProfile.longestStreak, newStreak);

  await client.playerProfile.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastProductiveDate: todayStr,
    },
  });

  // Mirror to character model if it exists
  await client.character.updateMany({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveAt: new Date(),
    },
  });

  // Check if reached a milestone
  if (STREAK_MILESTONES.includes(newStreak) && newStreak > currentProfile.currentStreak) {
    await createNotification(
      userId,
      NotificationType.STREAK_MILESTONE,
      `🔥 ${newStreak}-Day Streak Milestone!`,
      `You have maintained a productivity streak for ${newStreak} consecutive days!`,
      { streakDays: newStreak },
      client
    );

    await client.activityLog.create({
      data: {
        userId,
        action: LogAction.STREAK_MILESTONE,
        metadata: { streak: newStreak },
      },
    });
  }

  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastProductiveDate: todayStr,
    incremented: newStreak > currentProfile.currentStreak,
  };
};

export const getStreak = async (userId: string) => {
  const profile = await getOrCreateProfile(userId);

  // Generate past 7 days active status
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const past7Days: { date: string; dayName: string; isActive: boolean; isToday: boolean }[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const isToday = i === 0;

    // Check if active: either lastProductiveDate was today or within the active streak range
    let isActive = false;
    if (profile.lastProductiveDate) {
      const lastDate = new Date(`${profile.lastProductiveDate}T00:00:00.000Z`);
      const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
      const diffFromLast = Math.round((lastDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
      // If targetDate is within currentStreak days backwards from lastProductiveDate
      if (diffFromLast >= 0 && diffFromLast < profile.currentStreak) {
        isActive = true;
      }
    }

    past7Days.push({
      date: dateStr,
      dayName: daysOfWeek[d.getUTCDay()],
      isActive,
      isToday,
    });
  }

  return {
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    lastProductiveDate: profile.lastProductiveDate,
    nextMilestone: getNextMilestone(profile.currentStreak),
    motivation: getStreakMotivation(profile.currentStreak),
    weeklyCalendar: past7Days,
  };
};
