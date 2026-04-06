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

export type Role = { id: number; nombre: string };

export type UserDTO = {
  id: string;
  userId: string;
  email: string;
  nombre?: string | null;
  apellido?: string | null;
  avatarUrl?: string | null;
  rolId: number;
  rol?: Role | null;
};

export type UserRow = {
  id: string;
  userId: string;
  email: string;
  nombre?: string | null;
  apellido?: string | null;
  avatarUrl?: string | null;
  rol?: { id: number; nombre: string } | null;
};