/*
  Warnings:

  - The `nacionalidad` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Nacionalidad" AS ENUM ('Argentina', 'Brasil', 'Uruguay', 'Paraguay', 'Chile', 'Bolivia', 'Perú', 'Ecuador', 'Colombia', 'Venezuela', 'México', 'Guatemala', 'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panamá', 'Cuba', 'República Dominicana', 'España', 'Italia', 'Francia', 'Alemania', 'Reino Unido', 'Portugal', 'Estados Unidos', 'Canadá', 'China', 'Japón', 'Corea del Sur', 'India', 'Rusia', 'Ucrania', 'Marruecos', 'Nigeria', 'Sudáfrica', 'Argelia', 'Senegal', 'Turquía', 'Israel', 'Australia', 'Nueva Zelanda');

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "nacionalidad",
ADD COLUMN     "nacionalidad" "Nacionalidad";
