/*
  Warnings:

  - The primary key for the `subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `end_date` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `last_payment_date` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `subscription` table. All the data in the column will be lost.
  - The `id` column on the `subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription_type` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentId` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_subscription_id_fkey";

-- AlterTable
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_pkey",
DROP COLUMN "end_date",
DROP COLUMN "last_payment_date",
DROP COLUMN "payment_method",
DROP COLUMN "start_date",
DROP COLUMN "tenant_id",
DROP COLUMN "type",
DROP COLUMN "user_id",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "paymentId" TEXT NOT NULL,
ADD COLUMN     "plan" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
ADD CONSTRAINT "subscription_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "payment";

-- DropTable
DROP TABLE "subscription_type";

-- DropTable
DROP TABLE "transaction";

-- DropEnum
DROP TYPE "payment_status_type";

-- DropEnum
DROP TYPE "subscription_status_type";
