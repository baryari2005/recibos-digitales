import { prisma } from "@/lib/db";

export const UsersRepo = {
  findByEmailOrUserId: (email?: string, userId?: string) =>
    prisma.usuario.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          userId ? { userId } : undefined,
        ].filter(Boolean) as any,
      },
      include: { rol: true, legajo: true },
    }),

  findByEmail: (email: string) =>
    prisma.usuario.findUnique({ where: { email }, include: { rol: true, legajo: true } }),

  findByUserId: (userId: string) =>
    prisma.usuario.findUnique({ where: { userId }, include: { rol: true, legajo: true } }),

  findById: (id: string) =>
    prisma.usuario.findUnique({ where: { id }, include: { rol: true, legajo: true } }),

  updateEmail: (id: string, email: string) =>
    prisma.usuario.update({ where: { id }, data: { email } }),

  updatePassword: (id: string, passwordHash: string) =>
    prisma.usuario.update({ where: { id }, data: { password: passwordHash } }),
};
