import {
  Prisma,
  PrismaClient,
  LeaveStatus,
  LeaveType,
} from "@prisma/client";

function enumMatches<T extends Record<string, string>>(
  enm: T,
  q: string
): Array<T[keyof T]> {
  const upper = q.toUpperCase();

  return Object.values(enm).filter(
    (v): v is T[keyof T] => v.includes(upper)
  );
}

export class LeaveRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: {
    userId: string;
    type: LeaveType;
    startYmd: string;
    endYmd: string;
    daysCount: number;
    note?: string | null;
    attachments?: {
      fileName: string;
      fileUrl: string;
      filePath: string;
      mimeType: string;
      size?: number;
    }[];
  }) {
    return this.prisma.leaveRequest.create({
      data: {
        userId: data.userId,
        type: data.type,
        startYmd: data.startYmd,
        endYmd: data.endYmd,
        daysCount: data.daysCount,
        note: data.note?.trim() || null,
        attachments: data.attachments?.length
          ? {
              create: data.attachments,
            }
          : undefined,
      },
      include: {
        attachments: true,
      },
    });
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

    return this.prisma.leaveRequest.findFirst({
      where: {
        userId,
        type: LeaveType.VACACIONES,
        status: {
          in: [LeaveStatus.PENDIENTE, LeaveStatus.APROBADO],
        },
        startYmd: { lt: endYmd },
        endYmd: { gt: startYmd },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findPendingForApproval(params: {
    q?: string;
    page: number;
    pageSize: number;
    type?: "VACACIONES" | "OTHER";
  }) {
    const { q, page, pageSize, type } = params;

    const where: Prisma.LeaveRequestWhereInput = {
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

      const users = await this.prisma.usuario.findMany({
        where: {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { apellido: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });

      const userIds = users.map((u) => u.id);

      where.OR = [
        ...(userIds.length > 0 ? [{ userId: { in: userIds } }] : []),
        { note: { contains: q, mode: "insensitive" } },
        ...(typeMatches.length > 0 ? [{ type: { in: typeMatches } }] : []),
        ...(statusMatches.length > 0
          ? [{ status: { in: statusMatches } }]
          : []),
      ];
    }

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
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileUrl: true,
              filePath: true,
              mimeType: true,
              size: true,
              createdAt: true,
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
  }

  findByUser(userId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { userId },
      include: {
        attachments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        attachments: true,
      },
    });
  }

  cancel(id: string) {
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveStatus.CANCELADO },
    });
  }
}