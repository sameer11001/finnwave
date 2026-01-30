/*
  Warnings:

  - The `revocation_reason` column on the `sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `kyc_status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "kyc_status_enum" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "user_status_enum" AS ENUM ('active', 'suspended', 'closed');

-- CreateEnum
CREATE TYPE "revocation_reason_enum" AS ENUM ('user_logout', 'password_change', 'fraud', 'idle_timeout', 'token_reuse');

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "revocation_reason",
ADD COLUMN     "revocation_reason" "revocation_reason_enum";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "kyc_status",
ADD COLUMN     "kyc_status" "kyc_status_enum" NOT NULL DEFAULT 'pending',
DROP COLUMN "status",
ADD COLUMN     "status" "user_status_enum" NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX "users_kyc_status_idx" ON "users"("kyc_status");
