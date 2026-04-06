import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type CreateRoleInput = {
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
};

export type UpdateRoleInput = {
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
};

export async function getAllRoles() {
  return prisma.rol.findMany({
    include: {
      permisos: {
        include: {
          permiso: true,
        },
      },
      _count: {
        select: {
          permisos: true,
          usuarios: true,
        },
      },
    },
    orderBy: {
      nombre: "asc",
    },
  });
}

export async function getRoleById(id: number) {
  return prisma.rol.findUnique({
    where: { id },
    include: {
      permisos: {
        include: {
          permiso: true,
        },
      },
      _count: {
        select: {
          permisos: true,
          usuarios: true,
        },
      },
    },
  });
}

export async function createRole(data: CreateRoleInput) {
  return prisma.rol.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      activo: data.activo ?? true,
    },
  });
}

export async function updateRole(id: number, data: UpdateRoleInput) {
  return prisma.rol.update({
    where: { id },
    data: {
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.descripcion !== undefined && {
        descripcion: data.descripcion,
      }),
      ...(data.activo !== undefined && { activo: data.activo }),
    },
  });
}

export async function setRolePermissions(
  roleId: number,
  permisoIds: number[]
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.rolPermiso.deleteMany({
      where: { rolId: roleId },
    });

    if (permisoIds.length === 0) {
      return;
    }

    await tx.rolPermiso.createMany({
      data: permisoIds.map((permisoId) => ({
        rolId: roleId,
        permisoId,
      })),
    });
  });
}