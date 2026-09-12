-- Phase 4: authoritative player progression and immutable XP ledger.
CREATE TYPE "XpReason" AS ENUM ('QUEST_COMPLETION');

CREATE TABLE "player_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "strength" INTEGER NOT NULL DEFAULT 1,
    "intelligence" INTEGER NOT NULL DEFAULT 1,
    "discipline" INTEGER NOT NULL DEFAULT 1,
    "stamina" INTEGER NOT NULL DEFAULT 1,
    "consistency" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "player_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "xp_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "XpReason" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "xp_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "player_profiles_userId_key" ON "player_profiles"("userId");
CREATE INDEX "player_profiles_userId_idx" ON "player_profiles"("userId");
CREATE UNIQUE INDEX "xp_transactions_questId_key" ON "xp_transactions"("questId");
CREATE INDEX "xp_transactions_userId_idx" ON "xp_transactions"("userId");
CREATE INDEX "xp_transactions_createdAt_idx" ON "xp_transactions"("createdAt");
CREATE INDEX "xp_transactions_userId_createdAt_idx" ON "xp_transactions"("userId", "createdAt");

ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_questId_fkey"
  FOREIGN KEY ("questId") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
