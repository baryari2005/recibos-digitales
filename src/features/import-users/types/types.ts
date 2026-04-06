// src/components/import-users/types.ts
export type Source = "pdf" | "excel";

export type PdfRow = {
  cuil: string | null;
  apellidoNombre: string | null;
  legajo: string | null;
  fechaIngreso: string | null; // YYYY-MM-DD
  obraSocial: string | null;
};

export type ExcelRow = {
  userId: string | null;
  tipoDocumento: string | null;
  documento: string | null;
  cuil: string | null;
  email: string | null;
  nombre: string | null;
  apellido: string | null;
  fechaNacimiento: string | null;
  celular: string | null;
  domicilio: string | null;
  codigoPostal: string | null;
  estadoCivil: string | null;
  nacionalidad: string | null;
  legajo: string | null;
  genero: string | null;
  matriculaProvincial: string | null;
  matriculaNacional: string | null;
  fechaIngreso: string | null;
  fechaEgreso: string | null;
  estadoLaboral: string | null;
  tipoContrato: string | null;
  puesto: string | null;
  area: string | null;
  departamento: string | null;
  categoria: string | null;
  observaciones: string | null;
};

export type Cred = {
  userId: string;
  email: string;
  tempPassword: string;
  status: "created" | "updated";
};
