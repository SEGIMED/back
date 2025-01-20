/*
  Warnings:

  - You are about to drop the column `dnyType` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dni]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "dnyType",
ADD COLUMN     "dniType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_dni_key" ON "user"("dni");
