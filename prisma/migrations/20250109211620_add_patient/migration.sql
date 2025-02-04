/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apparment` to the `patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direction` to the `patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direction_number` to the `patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postal_code` to the `patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patient" ADD COLUMN     "apparment" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "direction" TEXT NOT NULL,
ADD COLUMN     "direction_number" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "postal_code" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "patient_userId_key" ON "patient"("userId");
