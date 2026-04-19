/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the column `ownerId` on the `Lease` table. All the data in the column will be lost.
  - You are about to alter the column `rentAmount` on the `Lease` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `deposit` on the `Lease` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the column `ownerId` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the column `ownerId` on the `Room` table. All the data in the column will be lost.
  - You are about to alter the column `rentAmount` on the `TenantProfile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `deposit` on the `TenantProfile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[propertyId,email]` on the table `TenantProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'UNDER_REVIEW';

-- DropIndex
DROP INDEX "Invoice_ownerId_idx";

-- DropIndex
DROP INDEX "Lease_ownerId_idx";

-- DropIndex
DROP INDEX "Payment_ownerId_idx";

-- DropIndex
DROP INDEX "Room_ownerId_idx";

-- DropIndex
DROP INDEX "TenantProfile_email_idx";

-- DropIndex
DROP INDEX "TenantProfile_phone_idx";

-- DropIndex
DROP INDEX "TenantProfile_userId_idx";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "ownerId",
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Lease" DROP COLUMN "ownerId",
ALTER COLUMN "rentAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "deposit" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "ownerId",
ADD COLUMN     "paidAt" TIMESTAMP(3),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "TenantProfile" ALTER COLUMN "rentAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "deposit" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_transactionRef_idx" ON "Payment"("transactionRef");

-- CreateIndex
CREATE UNIQUE INDEX "TenantProfile_propertyId_email_key" ON "TenantProfile"("propertyId", "email");
