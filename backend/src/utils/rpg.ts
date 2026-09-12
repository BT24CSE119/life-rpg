import { QuestPriority } from '@prisma/client';

const QUEST_XP: Record<QuestPriority, number> = {
  LOW: 10,
  MEDIUM: 25,
  HIGH: 50,
};

const QUEST_GOLD: Record<QuestPriority, number> = {
  LOW: 5,
  MEDIUM: 15,
  HIGH: 30,
};

export interface LevelProgress {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

/** Returns the server-authoritative XP reward for a quest or quest priority. */
export const calculateQuestXp = (input: QuestPriority | { priority: QuestPriority }): number => {
  const priority = typeof input === 'string' ? input : input.priority;
  return Math.max(0, QUEST_XP[priority] ?? 10);
};

export const calculateQuestXpReward = calculateQuestXp;

/** Returns the server-authoritative Gold reward for a quest or quest priority. */
export const calculateQuestGold = (input: QuestPriority | { priority: QuestPriority }): number => {
  const priority = typeof input === 'string' ? input : input.priority;
  return Math.max(0, QUEST_GOLD[priority] ?? 5);
};

export const calculateQuestGoldReward = calculateQuestGold;

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
