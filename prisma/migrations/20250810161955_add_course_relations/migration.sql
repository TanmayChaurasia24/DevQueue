/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `duration` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CourseLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "alreadyEnrolled" INTEGER DEFAULT 0,
ADD COLUMN     "availableLanguages" TEXT[],
ADD COLUMN     "courseLevel" "public"."CourseLevel" NOT NULL DEFAULT 'Beginner',
ADD COLUMN     "duration" TEXT NOT NULL,
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "skillsToGain" TEXT[];

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "name",
ADD COLUMN     "college" TEXT,
ADD COLUMN     "displayname" TEXT NOT NULL,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."CourseModules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skillsWillGain" TEXT[],
    "duration" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CourseModules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_Purchases" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Purchases_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Purchases_B_index" ON "public"."_Purchases"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."CourseModules" ADD CONSTRAINT "CourseModules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_Purchases" ADD CONSTRAINT "_Purchases_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_Purchases" ADD CONSTRAINT "_Purchases_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
