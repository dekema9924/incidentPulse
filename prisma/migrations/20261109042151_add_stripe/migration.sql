/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'TEAM', 'LIFETIME');

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Membership_stripeCustomerId_key" ON "Membership"("stripeCustomerId");
