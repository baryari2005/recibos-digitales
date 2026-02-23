import { PrismaClient } from "@prisma/client";

export class VacationBalanceRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async softDelete(id: string) {
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

    async findDeletedByUserAndYear(userId: string, year: number) {
        return this.prisma.vacationBalance.findFirst({
            where: {
                userId,
                year,
                deletedAt: { not: null },
            },
        });
    }

    findByUserAndYear(userId: string, year: number) {
        return this.prisma.vacationBalance.findUnique({
            where: {
                userId_year: { userId, year },
            },
        });
    }

    findAll(params: {
        q?: string;
        page: number;
        pageSize: number;
    }) {
        const { q, page, pageSize } = params;

        const where: any = {
            deletedAt: null,
        };

        if (q) {
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

        return Promise.all([
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
                orderBy: [
                    { user: { apellido: "asc" } },
                    { year: "desc" },
                ],
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.vacationBalance.count({ where }),
        ]).then(([items, total]) => ({ items, total }));
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

    update(id: string, data: Partial<{ totalDays: number; usedDays: number }>) {
        return this.prisma.vacationBalance.update({
            where: { id },
            data,
        });
    }

    restore(
        id: string,
        data: { totalDays: number }
    ) {
        return this.prisma.vacationBalance.update({
            where: { id },
            data: {
                totalDays: data.totalDays,
                deletedAt: null,
            },
        });
    }
}
