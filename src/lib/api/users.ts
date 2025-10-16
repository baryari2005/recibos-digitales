// src/lib/api/users.ts
import { axiosInstance } from "@/lib/axios";

export type User = {
  id: string;
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  roleId: number;
};

export type PersonnelFile = {
  employeeNumber?: number | null;
  documentType?: string | null;
  documentNumber?: string | null;
  cuil?: string | null;
  admissionDate?: string | null;
  terminationDate?: string | null;
  employmentStatus: string;
  contractType?: string | null;
  position?: string | null;
  area?: string | null;
  department?: string | null;
  category?: string | null;
  notes?: string | null;
};

const s = (v?: string | null) => (v && v.trim() !== "" ? v : undefined);
const n = (v?: number | null) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined);

export function cleanPersonnelFile(p: PersonnelFile): Partial<PersonnelFile> {
  return {
    employeeNumber: n(p.employeeNumber ?? null),
    documentType: s(p.documentType ?? undefined),      // Prisma enum on backend
    documentNumber: s(p.documentNumber ?? undefined),
    cuil: s(p.cuil ?? undefined),
    admissionDate: s(p.admissionDate ?? undefined),    // omit empty -> passes @IsDateString
    terminationDate: s(p.terminationDate ?? undefined),
    employmentStatus: p.employmentStatus,              // required enum
    contractType: s(p.contractType ?? undefined),      // Prisma enum on backend
    position: s(p.position ?? undefined),
    area: s(p.area ?? undefined),
    department: s(p.department ?? undefined),
    category: s(p.category ?? undefined),
    notes: s(p.notes ?? undefined),
  };
}

export async function getUser(id: string) {
  const { data } = await axiosInstance.get(`/users/${id}`);
  return data as User;
}

export async function getUserPersonnelFile(id: string) {
  const { data } = await axiosInstance.get(`/users/${id}/legajo`);
  return data as PersonnelFile | null;
}

export async function upsertUserPersonnelFile(id: string, payload: PersonnelFile) {
  const body = cleanPersonnelFile(payload);
  const { data } = await axiosInstance.put(`/users/${id}/legajo`, body);
  return data as PersonnelFile;
}
