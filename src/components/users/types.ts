import { NACIONALIDAD_VALUES } from "@/constants/nacionalidad";

export type UserFormValues = {
  userId: string;
  email: string;
  password?: string;
  rolId: number;

  nombre?: string;
  apellido?: string;
  avatarUrl?: string;

  tipoDocumento?: "DNI" | "PAS" | "LE" | "LC" | "CI";
  documento?: string;
  cuil?: string;

  celular?: string;
  domicilio?: string;
  codigoPostal?: string;

  fechaNacimiento?: string | null;
  genero?: "MASCULINO" | "FEMENINO" | "NO_BINARIO" | "PREFIERE_NO_DECIR" | "OTRO";
  estadoCivil?: "SOLTERO" | "CASADO" | "DIVORCIADO" | "VIUDO" | "UNION_CONVIVENCIAL" | "OTRO";
  nacionalidad?: typeof NACIONALIDAD_VALUES[number];
};