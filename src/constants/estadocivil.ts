export const ESTADO_CIVIL_OPCIONES = [
  "SOLTERO",
  "CASADO",
  "DIVORCIADO",
  "VIUDO",
  "UNIDO",
] as const;
export type EstadoCivil = typeof ESTADO_CIVIL_OPCIONES[number];