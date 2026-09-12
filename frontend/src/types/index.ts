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
  avatarUrl?: string | null;
  googleId?: string | null;
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
  category?: string | null;
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
  category?: string | null;
  priority?: QuestPriority;
  dueDate?: string | null;
}

export interface UpdateQuestInput {
  title?: string;
  description?: string | null;
  category?: string | null;
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
  attributes?: RpgAttributes;
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
  attributeGained?: {
    attribute: keyof RpgAttributes;
    amount: number;
  };
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

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  currentStreak: number;
  longestStreak: number;
  goldBalance: number;
  equipped: {
    title: string;
    badge?: string;
    frame?: string;
  };
  attributes: RpgAttributes;
}

// ============================================================
// --- Phase 6: Main RPG Dashboard Types ---
// ============================================================

export interface DashboardPlayer {
  name: string;
  email: string;
  level: number;
  totalXp: number;
  currentXp: number;
  xpForNextLevel: number;
  xpProgressPercentage: number;
  goldBalance: number;
}

export interface DashboardQuestsSummary {
  total: number;
  todo: number;
  inProgress: number;
  active: number;
  completed: number;
  completionPercentage: number;
}

export interface DashboardQuestItem {
  id: string;
  title: string;
  description?: string | null;
  priority: QuestPriority;
  status: QuestStatusType;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  xpReward: number;
  goldReward: number;
}

export interface DashboardActivityItem {
  id: string;
  type: 'QUEST_COMPLETED' | 'XP_EARNED' | 'GOLD_EARNED';
  title: string;
  amount?: number;
  balanceAfter?: number;
  timestamp: string;
  icon: string;
}

export interface DashboardEquippedItem {
  id: string;
  itemId: string;
  name: string;
  category: string;
  iconEmoji?: string | null;
  rarity: ItemRarity;
}

export interface DashboardAchievementsSummary {
  totalCount: number;
  unlockedCount: number;
  recentUnlocked: AchievementItem[];
}

export interface DashboardData {
  player: DashboardPlayer;
  attributes: RpgAttributes;
  quests: DashboardQuestsSummary;
  activeQuests: DashboardQuestItem[];
  recentlyCompletedQuests: DashboardQuestItem[];
  recentXpHistory: XpHistoryEntry[];
  recentGoldHistory: GoldHistoryItem[];
  recentActivity: DashboardActivityItem[];
  streak?: StreakInfo;
  dailyQuests?: DailyQuest[];
  achievements?: DashboardAchievementsSummary;
  inventoryCount?: number;
  equipped?: DashboardEquippedItem[];
  unreadNotificationsCount?: number;
}

export interface DashboardResponse {
  success: true;
  message: string;
  data: DashboardData;
}

// ============================================================
// --- Phase 8: Advanced Features Types ---
// ============================================================

export interface DailyQuest {
  id: string;
  userId: string;
  code: string;
  title: string;
  description: string | null;
  difficulty: QuestDifficulty;
  xpReward: number;
  goldReward: number;
  status: QuestStatusType;
  date: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyQuestCompletionResult {
  dailyQuest: DailyQuest;
  reward: {
    xpAwarded: number;
    goldAwarded: number;
    reason: string;
  };
  progression: ProgressionResult;
  streak?: {
    currentStreak: number;
    longestStreak: number;
    lastProductiveDate: string;
    incremented: boolean;
  };
  unlockedAchievements?: AchievementItem[];
  duplicateCompletion: boolean;
}

export interface WeeklyCalendarDay {
  date: string;
  dayName: string;
  isActive: boolean;
  isToday: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastProductiveDate: string | null;
  nextMilestone: number;
  motivation: string;
  weeklyCalendar: WeeklyCalendarDay[];
}

export interface AchievementProgress {
  current: number;
  target: number;
  percentage: number;
}

export interface AchievementItem {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  rarity: ItemRarity;
  xpReward: number;
  goldReward: number;
  iconEmoji: string;
  badgeUrl: string | null;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: AchievementProgress;
}

export interface AchievementsData {
  totalCount: number;
  unlockedCount: number;
  achievements: AchievementItem[];
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  category: string | null;
  goldCost: number;
  iconEmoji: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  ownedQuantity: number;
  isEquipped: boolean;
  canAfford: boolean;
}

export interface ShopData {
  items: ShopItem[];
  userGoldBalance: number;
}

export interface PurchaseResult {
  item: ShopItem;
  newGoldBalance: number;
  inventory: InventoryItem;
}

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  isEquipped: boolean;
  acquiredAt: string;
  item: {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    category: string | null;
    goldCost: number;
    iconEmoji: string | null;
    imageUrl?: string | null;
  };
}

export type NotificationType =
  | 'LEVEL_UP'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'QUEST_COMPLETED'
  | 'DAILY_QUEST'
  | 'STREAK_MILESTONE'
  | 'SHOP_PURCHASE'
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationsData {
  items: NotificationItem[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}



