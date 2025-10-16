-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMENINO', 'NO_BINARIO', 'PREFIERE_NO_DECIR', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_CONVIVENCIAL', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoTelefono" AS ENUM ('MOVIL', 'FIJO', 'LABORAL', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('INDETERMINADO', 'PLAZO_FIJO', 'TEMPORAL', 'PASANTIA', 'MONOTRIBUTO');

-- CreateEnum
CREATE TYPE "EstadoLaboral" AS ENUM ('ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'BAJA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('DNI', 'PAS', 'LE', 'LC', 'CI');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT,
    "apellido" TEXT,
    "avatarUrl" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "genero" "Genero",
    "estadoCivil" "EstadoCivil",
    "nacionalidad" TEXT,
    "deletedAt" TIMESTAMP(3),
    "rolId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Legajo" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "numeroLegajo" INTEGER,
    "tipoDocumento" "TipoDocumento" DEFAULT 'DNI',
    "documento" TEXT,
    "cuil" TEXT,
    "fechaIngreso" TIMESTAMP(3),
    "fechaEgreso" TIMESTAMP(3),
    "estadoLaboral" "EstadoLaboral" NOT NULL DEFAULT 'ACTIVO',
    "tipoContrato" "TipoContrato",
    "puesto" TEXT,
    "area" TEXT,
    "departamento" TEXT,
    "categoria" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Legajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_userId_key" ON "Usuario"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rolId_idx" ON "Usuario"("rolId");

-- CreateIndex
CREATE INDEX "Usuario_apellido_nombre_idx" ON "Usuario"("apellido", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Legajo_usuarioId_key" ON "Legajo"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Legajo_numeroLegajo_key" ON "Legajo"("numeroLegajo");

-- CreateIndex
CREATE UNIQUE INDEX "Legajo_documento_key" ON "Legajo"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Legajo_cuil_key" ON "Legajo"("cuil");

-- CreateIndex
CREATE INDEX "Legajo_estadoLaboral_idx" ON "Legajo"("estadoLaboral");

-- CreateIndex
CREATE INDEX "Legajo_area_departamento_idx" ON "Legajo"("area", "departamento");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");
