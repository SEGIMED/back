-- CreateTable
CREATE TABLE "patient_studies" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "physician_id" TEXT NOT NULL,
    "url" TEXT DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_studies_pkey" PRIMARY KEY ("id")
);
