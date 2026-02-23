import { PrismaClient } from "@prisma/client";

export class VacationBalanceService {
  constructor(private prisma: PrismaClient) {}

  async getBalancesForUse(userId: string, year: number) {
    return this.prisma.vacationBalance.findMany({
      where: {
        userId,
        year: { lte: year },
      },
      orderBy: { year: "asc" }, // 👈 más viejo primero
    });
  }

  async getAvailableDays(userId: string, year: number) {
    const balances = await this.getBalancesForUse(userId, year);

    return balances.reduce(
      (acc, b) => acc + (b.totalDays - b.usedDays),
      0
    );
  }

  async consumeDays(userId: string, year: number, days: number) {
    const balances = await this.getBalancesForUse(userId, year);

    let remaining = days;

    for (const b of balances) {
      const available = b.totalDays - b.usedDays;
      if (available <= 0) continue;

      const toConsume = Math.min(available, remaining);

      await this.prisma.vacationBalance.update({
        where: { id: b.id },
        data: { usedDays: b.usedDays + toConsume },
      });

      remaining -= toConsume;
      if (remaining === 0) break;
    }

    if (remaining > 0) {
      throw new Error("INSUFFICIENT_BALANCE");
    }
  }
}
