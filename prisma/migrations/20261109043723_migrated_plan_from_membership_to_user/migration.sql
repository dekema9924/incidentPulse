/*
  Warnings:

  - You are about to drop the column `plan` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `Membership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Membership_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "plan",
DROP COLUMN "stripeCustomerId";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_stripeCustomerId_key" ON "user"("stripeCustomerId");
