-- This is an empty migration.
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "Issue" ADD COLUMN "embedding" vector(384);