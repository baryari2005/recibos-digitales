// src/features/users/types.ts
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
