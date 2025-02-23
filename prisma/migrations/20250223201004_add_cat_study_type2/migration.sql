/*
  Warnings:

  - You are about to drop the column `nombre` on the `cat_study_type` table. All the data in the column will be lost.
  - Added the required column `name` to the `cat_study_type` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cat_study_type" DROP COLUMN "nombre",
ADD COLUMN     "name" TEXT NOT NULL;
