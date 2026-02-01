/*
  Warnings:

  - The `revocation_reason` column on the `sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `kyc_status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RevocationReason" AS ENUM ('USER_LOGOUT', 'PASSWORD_CHANGE', 'FRAUD', 'IDLE_TIMEOUT', 'TOKEN_REUSE');

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "revocation_reason",
ADD COLUMN     "revocation_reason" "RevocationReason";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "kyc_status",
ADD COLUMN     "kyc_status" "KycStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "kyc_status_enum";

-- DropEnum
DROP TYPE "revocation_reason_enum";

-- DropEnum
DROP TYPE "user_status_enum";

-- CreateIndex
CREATE INDEX "users_kyc_status_idx" ON "users"("kyc_status");
