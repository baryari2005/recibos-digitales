-- AlterTable
ALTER TABLE "Legajo"
  ALTER COLUMN "fechaIngreso" TYPE DATE USING ("fechaIngreso"::date),
  ALTER COLUMN "fechaEgreso"  TYPE DATE USING ("fechaEgreso"::date);

-- AlterTable
ALTER TABLE "Usuario"
  ALTER COLUMN "fechaNacimiento" TYPE DATE USING ("fechaNacimiento"::date);