// ============================================================
// Life RPG — Shared TypeScript Types (Phase 1)
// ============================================================

// --- API Response Wrappers ---

export interface ApiSuccess<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    stack?: string;
  };
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// --- Health Check ---

export interface HealthData {
  status: 'ok' | 'degraded';
  timestamp: string;
  responseTime: string;
  environment: string;
  database: {
    status: 'connected' | 'disconnected' | 'unconfigured';
    error?: string;
  };
}

export interface HealthResponse {
  success: boolean;
  message: string;
  data: HealthData;
}

// --- RPG Enums (mirrored from Prisma schema) ---

export type QuestDifficulty =
  | 'TRIVIAL'
  | 'EASY'
  | 'MEDIUM'
  | 'HARD'
  | 'EPIC'
  | 'LEGENDARY';

export type QuestStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'ABANDONED';

export type ItemType =
  | 'WEAPON'
  | 'ARMOR'
  | 'ACCESSORY'
  | 'CONSUMABLE'
  | 'COSMETIC'
  | 'BOOST';

export type ItemRarity =
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY';

// --- Character ---

export interface Character {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  level: number;
  xp: number;
  gold: number;
  hp: number;
  maxHp: number;
  strength: number;
  agility: number;
  intelligence: number;
  wisdom: number;
  vitality: number;
  charisma: number;
  totalXpEarned: number;
  totalGoldEarned: number;
  questsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

// --- Quest ---

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  tags: string[];
  difficulty: QuestDifficulty;
  xpReward: number;
  goldReward: number;
  status: QuestStatus;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Item ---

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  xpBonus: number;
  goldCost: number;
  imageUrl?: string;
  iconEmoji?: string;
}

// --- UI State ---

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UIError {
  message: string;
  code?: string;
}

// --- Preview / Static Demo Data (Phase 1 UI only) ---

export interface PreviewCharacter {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  hp: number;
  maxHp: number;
  currentStreak: number;
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
    wisdom: number;
    vitality: number;
    charisma: number;
  };
}

export interface PreviewQuest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  xpReward: number;
  goldReward: number;
  category: string;
  status: QuestStatus;
}
