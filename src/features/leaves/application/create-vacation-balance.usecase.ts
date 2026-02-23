import { VacationBalanceRepository } from "../infrastructure/vacation-balance.prisma-repository";

export class CreateVacationBalanceUseCase {
  constructor(private readonly repo: VacationBalanceRepository) {}

  async execute(params: {
    userId: string;
    year: number;
    totalDays: number;
  }) {
    if (params.totalDays <= 0) {
      throw new Error("TOTAL_DAYS_INVALID");
    }

    const existing = await this.repo.findByUserAndYear(
      params.userId,
      params.year
    );

    if (existing) {
      throw new Error("BALANCE_ALREADY_EXISTS");
    }

    return this.repo.create({
      userId: params.userId,
      year: params.year,
      totalDays: params.totalDays,
    });
  }
}
