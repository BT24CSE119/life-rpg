-- CreateEnum
CREATE TYPE "QuestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "quests" ADD COLUMN     "priority" "QuestPriority" NOT NULL DEFAULT 'MEDIUM';

-- CreateIndex
CREATE INDEX "quests_userId_priority_idx" ON "quests"("userId", "priority");
