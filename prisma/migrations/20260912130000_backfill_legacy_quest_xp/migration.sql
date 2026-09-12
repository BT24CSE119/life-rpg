-- Preserve Phase 3 completions by creating their one-time, authoritative XP
-- records. The unique questId constraint makes this safe for databases that
-- already contain Phase 4 transaction rows.

-- Profiles are normally created lazily. Existing users with old completed
-- quests need one before their historical XP can be recorded.
INSERT INTO "player_profiles" (
  "id", "userId", "totalXp", "level", "strength", "intelligence",
  "discipline", "stamina", "consistency", "createdAt", "updatedAt"
)
SELECT
  'legacy-profile-' || u."id", u."id", 0, 1, 1, 1, 1, 1, 1,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users" u
WHERE EXISTS (
  SELECT 1 FROM "quests" q
  WHERE q."userId" = u."id" AND q."status" = 'COMPLETED'
)
ON CONFLICT ("userId") DO NOTHING;

WITH inserted_transactions AS (
  INSERT INTO "xp_transactions" ("id", "userId", "questId", "amount", "reason", "createdAt")
  SELECT
    'legacy-xp-' || q."id",
    q."userId",
    q."id",
    CASE q."priority"
      WHEN 'LOW' THEN 10
      WHEN 'HIGH' THEN 50
      ELSE 25
    END,
    'QUEST_COMPLETION',
    COALESCE(q."completedAt", q."updatedAt", q."createdAt")
  FROM "quests" q
  LEFT JOIN "xp_transactions" x ON x."questId" = q."id"
  WHERE q."status" = 'COMPLETED' AND x."id" IS NULL
  RETURNING "userId", "amount"
), xp_to_apply AS (
  SELECT "userId", SUM("amount")::INTEGER AS "amount"
  FROM inserted_transactions
  GROUP BY "userId"
)
UPDATE "player_profiles" profile
SET
  "totalXp" = profile."totalXp" + xp_to_apply."amount",
  "level" = GREATEST(
    1,
    FLOOR((1 + SQRT(1 + (profile."totalXp" + xp_to_apply."amount") / 25.0)) / 2)::INTEGER
  ),
  "updatedAt" = CURRENT_TIMESTAMP
FROM xp_to_apply
WHERE profile."userId" = xp_to_apply."userId";
