-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "AccommodationObject" ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'APPROVED';
