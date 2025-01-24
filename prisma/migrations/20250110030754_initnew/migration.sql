/*
  Warnings:

  - You are about to drop the column `tenantId` on the `patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patient" DROP COLUMN "tenantId";
