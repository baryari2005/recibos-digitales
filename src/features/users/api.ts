// src/features/users/api.ts
import { axiosInstance } from "@/lib/axios";
import type { Role, UserDTO } from "./types";

export async function listRoles(): Promise<Role[]> {
  const { data } = await axiosInstance.get("/roles");
  return data?.data ?? data ?? [];
}

export async function getUser(id: string): Promise<UserDTO> {
  const { data } = await axiosInstance.get(`/users/${id}`);
  return data;
}

export async function createUser(dto: any): Promise<UserDTO> {
  const { data } = await axiosInstance.post("/users", dto);
  return data;
}

export async function updateUser(id: string, dto: any): Promise<UserDTO> {
  // Tu Nest usa PATCH en /users/:id
  const { data } = await axiosInstance.patch(`/users/${id}`, dto);
  return data;
}
