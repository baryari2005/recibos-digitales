export const ESTADO_CIVIL_OPCIONES = [
  "SOLTERO",
  "CASADO",
  "DIVORCIADO",
  "VIUDO",
  "UNION_CONVIVENCIAL", // 👈 correcto
  "OTRO",
] as const;
export type EstadoCivil = typeof ESTADO_CIVIL_OPCIONES[number];