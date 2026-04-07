import {
  Prisma,
  PrismaClient,
  LeaveStatus,
} from "@prisma/client";
import { normalizeLeaveTypeCode } from "@/features/leave-types/lib/leave-type.helpers";

const VACATION_TYPE_CODE = "VACACIONES";

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
    type: string;
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
    const normalizedTypeCode = normalizeLeaveTypeCode(data.type);
    const createData: Prisma.LeaveRequestCreateInput = {
      user: {
        connect: {
          id: data.userId,
        },
      },
      typeCatalog: {
        connect: {
          code: normalizedTypeCode,
        },
      },
      startYmd: data.startYmd,
      endYmd: data.endYmd,
      daysCount: data.daysCount,
      note: data.note?.trim() || null,
      attachments: data.attachments?.length
        ? {
            create: data.attachments,
          }
        : undefined,
    };

    return this.prisma.leaveRequest.create({
      data: createData,
      include: {
        attachments: true,
        typeCatalog: true,
      },
    });
  }

  findPendingVacationByUser(userId: string) {
    return this.prisma.leaveRequest.findFirst({
      where: {
        userId,
        typeCatalog: {
          is: {
            code: VACATION_TYPE_CODE,
          },
        },
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
        typeCatalog: {
          is: {
            code: VACATION_TYPE_CODE,
          },
        },
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
      where.typeCatalog = {
        is: {
          code: VACATION_TYPE_CODE,
        },
      };
    }

    if (type === "OTHER") {
      where.typeCatalog = {
        isNot: {
          code: VACATION_TYPE_CODE,
        },
      };
    }

    if (q) {
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
        {
          typeCatalog: {
            is: {
              OR: [
                { code: { contains: q, mode: "insensitive" } },
                { label: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
        ...(statusMatches.length > 0
          ? [{ status: { in: statusMatches } }]
          : []),
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        include: {
          typeCatalog: {
            select: {
              code: true,
              label: true,
            },
          },
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

    return {
      items: items.map((item) => ({
        ...item,
        type: item.typeCatalog.label,
        typeCode: item.typeCatalog.code,
      })),
      total,
    };
  }

  findByUser(userId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { userId },
      include: {
        attachments: true,
        typeCatalog: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        attachments: true,
        typeCatalog: true,
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
