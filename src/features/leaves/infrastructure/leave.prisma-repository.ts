import { PrismaClient, LeaveStatus, LeaveType } from "@prisma/client";

function enumMatches<T extends Record<string, string>>(enm: T, q: string) {
  const upper = q.toUpperCase();

  return Object.values(enm).filter((v) =>
    v.includes(upper)
  );
}

export class LeaveRepository {
  constructor(private readonly prisma: PrismaClient) { }

  create(data: {
    userId: string;
    type: any;
    startYmd: string;
    endYmd: string;
    daysCount: number;
    note?: string;
  }) {
    return this.prisma.leaveRequest.create({ data });
  }

  findPendingVacationByUser(userId: string) {
    return this.prisma.leaveRequest.findFirst({
      where: {
        userId,
        type: LeaveType.VACACIONES,
        status: LeaveStatus.PENDIENTE,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findOverlappingVacationsByUser(params: {
    userId: string;
    startYmd: string;
    endYmd: string;
  }) {
    const { userId, startYmd, endYmd } = params;

    // Importante: como tu endYmd es "Regreso", tratamos rango como [start, end)
    // Overlap si existing.start < new.end AND existing.end > new.start
    return this.prisma.leaveRequest.findFirst({
      where: {
        userId,
        type: LeaveType.VACACIONES,
        status: { in: [LeaveStatus.PENDIENTE, LeaveStatus.APROBADO] }, // si tu enum difiere, ajustalo
        startYmd: { lt: endYmd },
        endYmd: { gt: startYmd },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findPendingForApproval(params: {
    q?: string;
    page: number;
    pageSize: number;
    type?: "VACACIONES" | "OTHER";
  }) {
    const { q, page, pageSize, type } = params;

    const where: any = {
      status: LeaveStatus.PENDIENTE,
    };

    if (type === "VACACIONES") {
      where.type = LeaveType.VACACIONES;
    }

    if (type === "OTHER") {
      where.type = { not: LeaveType.VACACIONES };
    }

    if (q) {
      const typeMatches = enumMatches(LeaveType, q);
      const statusMatches = enumMatches(LeaveStatus, q);

      // 🔹 1. Buscar usuarios que matchean
      const usersPromise = this.prisma.usuario.findMany({
        where: {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { apellido: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });

      return usersPromise.then(async (users) => {
        const userIds = users.map(u => u.id);

        where.OR = [
          ...(userIds.length
            ? [{ userId: { in: userIds } }]
            : []),

          {
            note: { contains: q, mode: "insensitive" },
          },

          ...(typeMatches.length
            ? [{ type: { in: typeMatches } }]
            : []),

          ...(statusMatches.length
            ? [{ status: { in: statusMatches } }]
            : []),
        ];

        const [items, total] = await Promise.all([
          this.prisma.leaveRequest.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  legajo: {
                    select: { numeroLegajo: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "asc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
          this.prisma.leaveRequest.count({ where }),
        ]);

        return { items, total };
      });
    }

    // 🔹 sin búsqueda
    return Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              legajo: {
                select: { numeroLegajo: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.leaveRequest.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findByUser(userId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return this.prisma.leaveRequest.findUnique({ where: { id } });
  }

  cancel(id: string) {
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveStatus.CANCELADO },
    });
  }
}
