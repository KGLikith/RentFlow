/*
  Warnings:

  - You are about to drop the column `email` on the `TenantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `TenantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TenantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `TenantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedAt` on the `TenantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `TenantProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `TenantProfile` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `TenantProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "TenantProfile" DROP CONSTRAINT "TenantProfile_userId_fkey";

-- DropIndex
DROP INDEX "TenantProfile_propertyId_email_key";

-- AlterTable
ALTER TABLE "TenantProfile" DROP COLUMN "email",
DROP COLUMN "isVerified",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "rejectedAt",
DROP COLUMN "verifiedAt",
ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "TenantInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomId" TEXT,
    "rentAmount" DECIMAL(10,2) NOT NULL,
    "deposit" DECIMAL(10,2) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantInvitation_token_key" ON "TenantInvitation"("token");

-- CreateIndex
CREATE INDEX "TenantInvitation_email_status_expiresAt_idx" ON "TenantInvitation"("email", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "TenantInvitation_ownerId_status_idx" ON "TenantInvitation"("ownerId", "status");

-- CreateIndex
CREATE INDEX "TenantInvitation_propertyId_idx" ON "TenantInvitation"("propertyId");

-- CreateIndex
CREATE INDEX "Invoice_propertyId_idx" ON "Invoice"("propertyId");

-- CreateIndex
CREATE INDEX "Invoice_tenantProfileId_status_idx" ON "Invoice"("tenantProfileId", "status");

-- CreateIndex
CREATE INDEX "Lease_propertyId_idx" ON "Lease"("propertyId");

-- CreateIndex
CREATE INDEX "Payment_tenantProfileId_idx" ON "Payment"("tenantProfileId");

-- CreateIndex
CREATE INDEX "Room_propertyId_idx" ON "Room"("propertyId");

-- CreateIndex
CREATE INDEX "TenantProfile_roomId_idx" ON "TenantProfile"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantProfile_userId_key" ON "TenantProfile"("userId");

-- AddForeignKey
ALTER TABLE "TenantInvitation" ADD CONSTRAINT "TenantInvitation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantInvitation" ADD CONSTRAINT "TenantInvitation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantInvitation" ADD CONSTRAINT "TenantInvitation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantProfile" ADD CONSTRAINT "TenantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
