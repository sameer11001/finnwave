/*
  Warnings:

  - The values [VERIFIED] on the enum `KycStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'PDF', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('KYC_DOCUMENT', 'USER_AVATAR', 'TRANSACTION_RECEIPT', 'SUPPORT_ATTACHMENT', 'PROFILE_DOCUMENT', 'CHAT_ATTACHMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "KycDocumentType" AS ENUM ('PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID', 'PROOF_OF_ADDRESS_UTILITY', 'PROOF_OF_ADDRESS_BANK', 'PROOF_OF_ADDRESS_LEASE', 'SELFIE', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "KycStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."users" ALTER COLUMN "kyc_status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "kyc_status" TYPE "KycStatus_new" USING ("kyc_status"::text::"KycStatus_new");
ALTER TABLE "kyc_submissions" ALTER COLUMN "status" TYPE "KycStatus_new" USING ("status"::text::"KycStatus_new");
ALTER TYPE "KycStatus" RENAME TO "KycStatus_old";
ALTER TYPE "KycStatus_new" RENAME TO "KycStatus";
DROP TYPE "public"."KycStatus_old";
ALTER TABLE "users" ALTER COLUMN "kyc_status" SET DEFAULT 'PENDING';
COMMIT;

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "category" "MediaCategory" NOT NULL DEFAULT 'OTHER',
    "type" "MediaType" NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT 'PENDING',
    "original_file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "encrypted_path" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "metadata" JSONB,
    "verified_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "rejection_reason" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "rejection_reason" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "kyc_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" TEXT NOT NULL,
    "kyc_submission_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "document_type" "KycDocumentType" NOT NULL,
    "document_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "issuing_country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_encrypted_path_key" ON "media"("encrypted_path");

-- CreateIndex
CREATE INDEX "media_uploaded_by_idx" ON "media"("uploaded_by");

-- CreateIndex
CREATE INDEX "media_category_idx" ON "media"("category");

-- CreateIndex
CREATE INDEX "media_status_idx" ON "media"("status");

-- CreateIndex
CREATE INDEX "media_uploaded_at_idx" ON "media"("uploaded_at");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_submissions_user_id_key" ON "kyc_submissions"("user_id");

-- CreateIndex
CREATE INDEX "kyc_submissions_user_id_idx" ON "kyc_submissions"("user_id");

-- CreateIndex
CREATE INDEX "kyc_submissions_status_idx" ON "kyc_submissions"("status");

-- CreateIndex
CREATE INDEX "kyc_documents_kyc_submission_id_idx" ON "kyc_documents"("kyc_submission_id");

-- CreateIndex
CREATE INDEX "kyc_documents_media_id_idx" ON "kyc_documents"("media_id");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_documents_kyc_submission_id_document_type_key" ON "kyc_documents"("kyc_submission_id", "document_type");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_kyc_submission_id_fkey" FOREIGN KEY ("kyc_submission_id") REFERENCES "kyc_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
