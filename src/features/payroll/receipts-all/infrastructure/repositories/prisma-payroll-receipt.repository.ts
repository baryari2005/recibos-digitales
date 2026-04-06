import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { FindPayrollReceiptsFilters, PayrollReceiptRepository } from "../../repositories/payroll-receipt.repository";
import { ReceiptSlim, UserSlim } from "../../types/payroll-receipt.types";

export class PrismaPayrollReceiptRepository implements PayrollReceiptRepository {
  async findMatchedUserCuils(params: {
    search: string;
    cuilDigits: string;
  }): Promise<string[]> {
    const { search, cuilDigits } = params;

    const users = await prisma.usuario.findMany({
      where: {
        OR: [
          { apellido: { contains: search, mode: "insensitive" } },
          { nombre: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { userId: { contains: search, mode: "insensitive" } },
          ...(cuilDigits ? [{ cuil: { contains: cuilDigits } }] : []),
        ],
      },
      select: { cuil: true },
    });

    return users
      .map((user) => user.cuil)
      .filter((cuil): cuil is string => cuil !== null);
  }

  async findReceipts(
    filters: FindPayrollReceiptsFilters
  ): Promise<ReceiptSlim[]> {
    const where: Prisma.PayrollReceiptWhereInput = {};

    if (filters.fromDate || filters.toDate) {
      where.periodDate = {
        ...(filters.fromDate ? { gte: filters.fromDate } : {}),
        ...(filters.toDate ? { lte: filters.toDate } : {}),
      };
    }

    if (filters.status === "signed") {
      where.signed = true;
      where.signedDisagreement = false;
    } else if (filters.status === "disagreement") {
      where.signedDisagreement = true;
    } else if (filters.status === "unsigned") {
      where.signed = false;
      where.signedDisagreement = false;
    }

    if (filters.search) {
      where.OR = [
        ...(filters.cuilDigits ? [{ cuil: { contains: filters.cuilDigits } }] : []),
        ...(filters.matchedCuils?.length ? [{ cuil: { in: filters.matchedCuils } }] : []),
      ];
    }

    return prisma.payrollReceipt.findMany({
      where,
      orderBy: [{ cuil: "asc" }, { periodDate: "desc" }],
      select: {
        id: true,
        cuil: true,
        period: true,
        periodDate: true,
        fileUrl: true,
        filePath: true,
        signed: true,
        signedDisagreement: true,
        observations: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findUsersByCuils(cuils: string[]): Promise<UserSlim[]> {
    if (!cuils.length) return [];

    return prisma.usuario.findMany({
      where: { cuil: { in: cuils } },
      select: {
        id: true,
        userId: true,
        email: true,
        nombre: true,
        apellido: true,
        cuil: true,
      },
    });
  }
}