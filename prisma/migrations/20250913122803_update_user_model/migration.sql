/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'runner',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "displayName" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "idx_user_provider_pid" ON "public"."User"("provider", "providerId");
