import { QuestPriority } from '@prisma/client';

const QUEST_XP: Record<QuestPriority, number> = {
  LOW: 10,
  MEDIUM: 25,
  HIGH: 50,
};

export interface LevelProgress {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

/** Returns the server-authoritative reward for a quest priority. */
export const calculateQuestXp = (priority: QuestPriority): number => QUEST_XP[priority];

/** Cumulative XP required to start a level. Level 1 starts at zero XP. */
export const getTotalXpRequiredForLevel = (level: number): number =>
  50 * level * (level - 1);

/** XP required to advance from the supplied level to the next level. */
export const getXpRequiredForNextLevel = (level: number): number => 100 * level;

export const calculateLevelFromXp = (totalXp: number): number => {
  const safeXp = Math.max(0, totalXp);
  // Solve 50 * level * (level - 1) <= XP, then correct rounding defensively.
  let level = Math.max(1, Math.floor((1 + Math.sqrt(1 + safeXp / 25)) / 2));
  while (getTotalXpRequiredForLevel(level + 1) <= safeXp) level += 1;
  while (level > 1 && getTotalXpRequiredForLevel(level) > safeXp) level -= 1;
  return level;
};

export const getLevelProgress = (totalXp: number): LevelProgress => {
  const safeXp = Math.max(0, totalXp);
  const level = calculateLevelFromXp(safeXp);
  const levelStartXp = getTotalXpRequiredForLevel(level);
  const nextLevelXp = getXpRequiredForNextLevel(level);
  const currentLevelXp = safeXp - levelStartXp;

  return {
    level,
    totalXp: safeXp,
    currentLevelXp,
    nextLevelXp,
    progressPercent: Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100)),
  };
};
