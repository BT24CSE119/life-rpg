-- CreateEnum
CREATE TYPE "GoldTransactionType" AS ENUM ('QUEST_REWARD', 'BONUS', 'PENALTY', 'ADMIN_ADJUSTMENT', 'PURCHASE', 'REFUND');

-- CreateEnum
CREATE TYPE "GoldReason" AS ENUM ('QUEST_COMPLETION', 'BONUS');

-- AlterTable
ALTER TABLE "player_profiles" ADD COLUMN "goldBalance" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "gold_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "type" "GoldTransactionType" NOT NULL,
    "reason" "GoldReason" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gold_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gold_transactions_questId_key" ON "gold_transactions"("questId");

-- CreateIndex
CREATE INDEX "gold_transactions_userId_idx" ON "gold_transactions"("userId");

-- CreateIndex
CREATE INDEX "gold_transactions_createdAt_idx" ON "gold_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "gold_transactions_userId_createdAt_idx" ON "gold_transactions"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "gold_transactions" ADD CONSTRAINT "gold_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gold_transactions" ADD CONSTRAINT "gold_transactions_questId_fkey" FOREIGN KEY ("questId") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
