export type PermissionDTO = {
  modulo: string;
  accion: string;
};

export type UserDTO = {
  id: string;
  userId: string | null;
  email?: string;
  nombre?: string;
  apellido?: string;
  mustChangePassword?: boolean;
  avatarUrl?: string | null;
  permisos?: PermissionDTO[];
};

export type LoginBody = {
  email?: string;
  userId?: string;
  password: string;
};

export type AuthMeResponse = {
  user?: UserDTO | null;
};

export type AuthLoginResponse = {
  token?: string;
  accessToken?: string;
};