import { Prisma, PrismaClient } from "@prisma/client";

export class VacationBalanceRepository {
  constructor(private readonly prisma: PrismaClient) { }

  softDelete(id: string) {
    return this.prisma.vacationBalance.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  getByUserAndYear(userId: string, year: number) {
    return this.prisma.vacationBalance.findUnique({
      where: {
        userId_year: {
          userId,
          year,
        },
      },
    });
  }

  findByUserAndYear(userId: string, year: number) {
    return this.prisma.vacationBalance.findFirst({
      where: {
        userId,
        year,
        deletedAt: null,
      },
    });
  }

  findDeletedByUserAndYear(userId: string, year: number) {
    return this.prisma.vacationBalance.findFirst({
      where: {
        userId,
        year,
        deletedAt: { not: null },
      },
    });
  }

  async findAll(params: {
    q?: string;
    page: number;
    pageSize: number;
  }) {
    const { q, page, pageSize } = params;

    const where: Prisma.VacationBalanceWhereInput = {
      deletedAt: null,
    };

    if (q?.trim()) {
      const parts = q.trim().split(/\s+/);

      where.user = {
        AND: parts.map((part) => ({
          OR: [
            { nombre: { contains: part, mode: "insensitive" } },
            { apellido: { contains: part, mode: "insensitive" } },
          ],
        })),
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.vacationBalance.findMany({
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
        orderBy: [{ user: { apellido: "asc" } }, { year: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.vacationBalance.count({ where }),
    ]);

    return { items, total };
  }

  create(data: {
    userId: string;
    year: number;
    totalDays: number;
  }) {
    return this.prisma.vacationBalance.create({
      data,
    });
  }

  update(id: string, data: Prisma.VacationBalanceUpdateInput) {
    return this.prisma.vacationBalance.update({
      where: { id },
      data,
    });
  }

  restore(id: string, data: { totalDays: number }) {
    return this.prisma.vacationBalance.update({
      where: { id },
      data: {
        totalDays: data.totalDays,
        deletedAt: null,
      },
    });
  }
}