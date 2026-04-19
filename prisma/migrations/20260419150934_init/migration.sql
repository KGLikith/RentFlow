-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'TENANT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'OWNER';
