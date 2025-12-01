-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('VACACIONES', 'ENFERMEDAD', 'CASAMIENTO', 'ESTUDIOS', 'EXCEDENCIA', 'FALLECIMIENTO', 'CON_GOCE', 'SIN_GOCE', 'MATERNIDAD', 'NACIMIENTO', 'SEMANA_EXTRA');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "LeaveType" NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDIENTE',
    "startYmd" TEXT NOT NULL,
    "endYmd" TEXT NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "note" TEXT,
    "approverId" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "typeCatalogId" INTEGER,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveTypeCatalog" (
    "id" SERIAL NOT NULL,
    "code" "LeaveType" NOT NULL,
    "label" TEXT NOT NULL,
    "colorHex" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveTypeCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeaveRequest_userId_createdAt_idx" ON "LeaveRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_createdAt_idx" ON "LeaveRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "LeaveRequest_userId_startYmd_idx" ON "LeaveRequest"("userId", "startYmd");

-- CreateIndex
CREATE INDEX "LeaveRequest_userId_endYmd_idx" ON "LeaveRequest"("userId", "endYmd");

-- CreateIndex
CREATE INDEX "LeaveRequest_typeCatalogId_idx" ON "LeaveRequest"("typeCatalogId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveTypeCatalog_code_key" ON "LeaveTypeCatalog"("code");

-- CreateIndex
CREATE INDEX "LeaveTypeCatalog_isActive_idx" ON "LeaveTypeCatalog"("isActive");
