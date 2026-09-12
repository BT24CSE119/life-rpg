-- Enum values added by the preceding migration are committed before using
-- TODO as the column default; PostgreSQL requires this separation.
ALTER TABLE "quests" ALTER COLUMN "status" SET DEFAULT 'TODO';
