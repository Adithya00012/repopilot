-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "label" TEXT;
