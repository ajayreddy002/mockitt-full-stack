-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "isPremium" BOOLEAN DEFAULT false,
ADD COLUMN     "profilePicture" TEXT;
