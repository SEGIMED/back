/*
  Warnings:

  - You are about to drop the column `last_name` on the `patient` table. All the data in the column will be lost.
  - Added the required column `dnyType` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patient" DROP COLUMN "last_name",
ALTER COLUMN "apparment" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "direction" DROP NOT NULL,
ALTER COLUMN "direction_number" DROP NOT NULL,
ALTER COLUMN "postal_code" DROP NOT NULL,
ALTER COLUMN "province" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "dnyType" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT,
ALTER COLUMN "phone_prefix" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;
