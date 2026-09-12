// ============================================================
// Life RPG — Shared TypeScript Types (Phase 1 + Phase 2)
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

// Statuses used by static landing/dashboard preview data.
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

// ============================================================
// --- Phase 2: Authentication Types ---
// ============================================================

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface SignupDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: true;
  message: string;
  data: {
    user: User;
    accessToken?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiValidationError {
  success: false;
  error: {
    message: string;
    details?: ValidationError[];
  };
}

// ============================================================
// --- Phase 3: Quest Types ---
// ============================================================

export type QuestPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type QuestStatusType =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  // Retained for quests created before Phase 3's streamlined workflow.
  | 'ACTIVE'
  | 'FAILED'
  | 'ABANDONED';

export interface Quest {
  id: string;
  title: string;
  description: string | null;
  priority: QuestPriority;
  status: QuestStatusType;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateQuestInput {
  title: string;
  description?: string;
  priority?: QuestPriority;
  dueDate?: string | null;
}

export interface UpdateQuestInput {
  title?: string;
  description?: string | null;
  priority?: QuestPriority;
  status?: QuestStatusType;
  dueDate?: string | null;
}

// ============================================================
// --- Phase 4 & 5: RPG Progression & Gold Types ---
// ============================================================

export interface RpgAttributes {
  strength: number;
  intelligence: number;
  discipline: number;
  stamina: number;
  consistency: number;
}

export interface ProgressionResult {
  previousLevel: number;
  newLevel: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  goldBalance: number;
  levelUp: boolean;
}

export interface RpgProfile {
  userId: string;
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  goldBalance: number;
  attributes: RpgAttributes;
}

export interface RewardResult {
  xpAwarded: number;
  goldAwarded: number;
  reason: 'QUEST_COMPLETION';
}

export interface RewardsSummary {
  xp: number;
  gold: number;
}

export interface QuestCompletionResult {
  quest: Quest;
  reward: RewardResult;
  rewards?: RewardsSummary;
  progression: ProgressionResult;
  duplicateCompletion: boolean;
}

export interface XpHistoryEntry {
  id: string;
  amount: number;
  reason: 'QUEST_COMPLETION';
  questId: string;
  questTitle: string;
  createdAt: string;
}

export interface XpHistoryResult {
  entries: XpHistoryEntry[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export type GoldTransactionType =
  | 'QUEST_REWARD'
  | 'BONUS'
  | 'PENALTY'
  | 'ADMIN_ADJUSTMENT'
  | 'PURCHASE'
  | 'REFUND';

export type GoldReason = 'QUEST_COMPLETION' | 'BONUS';

export interface GoldHistoryItem {
  id: string;
  amount: number;
  balanceAfter: number;
  type: GoldTransactionType;
  reason: GoldReason;
  questId: string | null;
  questTitle: string | null;
  createdAt: string;
}

export interface GoldHistoryResult {
  items: GoldHistoryItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface GoldWalletResult {
  goldBalance: number;
}

export interface RpgStats extends RpgProfile {
  completedQuests: number;
  totalQuests: number;
}

