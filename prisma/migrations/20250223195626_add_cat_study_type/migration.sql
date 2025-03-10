/*
  Warnings:

  - Added the required column `cat_study_type_id` to the `patient_studies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patient_studies" ADD COLUMN     "cat_study_type_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "cat_study_type" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "cat_study_type_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patient_studies" ADD CONSTRAINT "patient_studies_cat_study_type_id_fkey" FOREIGN KEY ("cat_study_type_id") REFERENCES "cat_study_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
