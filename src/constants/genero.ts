export const GENERO_OPCIONES = [
  "MASCULINO",
  "FEMENINO",
  "NO_BINARIO",
  "OTRO",
  "PREFIERO_NO_DECIR",
] as const;
export type Genero = typeof GENERO_OPCIONES[number];