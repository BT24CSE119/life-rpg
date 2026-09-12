-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LEVEL_UP', 'ACHIEVEMENT_UNLOCKED', 'QUEST_COMPLETED', 'DAILY_QUEST', 'STREAK_MILESTONE', 'SHOP_PURCHASE', 'SYSTEM');

-- AlterEnum
ALTER TYPE "GoldReason" ADD VALUE 'DAILY_QUEST_COMPLETION';
ALTER TYPE "GoldReason" ADD VALUE 'ACHIEVEMENT_UNLOCKED';
ALTER TYPE "GoldReason" ADD VALUE 'SHOP_PURCHASE';

-- AlterEnum
ALTER TYPE "LogAction" ADD VALUE 'DAILY_QUEST_COMPLETED';
ALTER TYPE "LogAction" ADD VALUE 'ITEM_EQUIPPED';
ALTER TYPE "LogAction" ADD VALUE 'ITEM_UNEQUIPPED';
ALTER TYPE "LogAction" ADD VALUE 'ACHIEVEMENT_UNLOCKED';

-- AlterEnum
ALTER TYPE "XpReason" ADD VALUE 'DAILY_QUEST_COMPLETION';
ALTER TYPE "XpReason" ADD VALUE 'ACHIEVEMENT_UNLOCKED';

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "player_profiles" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastProductiveDate" TEXT,
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "xp_transactions" ALTER COLUMN "questId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "daily_quests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "QuestDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "xpReward" INTEGER NOT NULL DEFAULT 30,
    "goldReward" INTEGER NOT NULL DEFAULT 15,
    "status" "QuestStatus" NOT NULL DEFAULT 'TODO',
    "date" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "rarity" "ItemRarity" NOT NULL DEFAULT 'COMMON',
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "goldReward" INTEGER NOT NULL DEFAULT 25,
    "iconEmoji" TEXT NOT NULL DEFAULT '🏆',
    "badgeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_quests_userId_idx" ON "daily_quests"("userId");

-- CreateIndex
CREATE INDEX "daily_quests_userId_date_idx" ON "daily_quests"("userId", "date");

-- CreateIndex
CREATE INDEX "daily_quests_userId_status_idx" ON "daily_quests"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "daily_quests_userId_date_code_key" ON "daily_quests"("userId", "date", "code");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- CreateIndex
CREATE INDEX "user_achievements_achievementId_idx" ON "user_achievements"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "daily_quests" ADD CONSTRAINT "daily_quests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
