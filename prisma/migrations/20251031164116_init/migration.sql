/*
  Warnings:

  - You are about to drop the column `cuil` on the `Legajo` table. All the data in the column will be lost.
  - You are about to drop the column `documento` on the `Legajo` table. All the data in the column will be lost.
  - You are about to drop the column `tipoDocumento` on the `Legajo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documento]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cuil]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Legajo_cuil_key";

-- DropIndex
DROP INDEX "public"."Legajo_documento_key";

-- AlterTable
ALTER TABLE "Legajo" DROP COLUMN "cuil",
DROP COLUMN "documento",
DROP COLUMN "tipoDocumento",
ADD COLUMN     "matriculaNacional" TEXT,
ADD COLUMN     "matriculaProvincial" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "celular" TEXT,
ADD COLUMN     "codigoPostal" TEXT,
ADD COLUMN     "cuil" TEXT,
ADD COLUMN     "documento" TEXT,
ADD COLUMN     "domicilio" TEXT,
ADD COLUMN     "tipoDocumento" "TipoDocumento" DEFAULT 'DNI';

-- CreateTable
CREATE TABLE "payroll_receipts" (
    "id" TEXT NOT NULL,
    "cuil" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodDate" TIMESTAMP(3) NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "signed" BOOLEAN NOT NULL DEFAULT false,
    "signedDisagreement" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payroll_receipts_cuil_periodDate_idx" ON "payroll_receipts"("cuil", "periodDate");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_receipts_cuil_period_key" ON "payroll_receipts"("cuil", "period");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_documento_key" ON "Usuario"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cuil_key" ON "Usuario"("cuil");
