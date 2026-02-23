import { VacationBalanceRepository } from "../infrastructure/vacation-balance.prisma-repository";

export class RestoreVacationBalanceUseCase {
  constructor(private readonly repo: VacationBalanceRepository) {}

  async execute(id: string, totalDays: number) {
    if (totalDays < 0) {
      throw new Error("INVALID_TOTAL_DAYS");
    }

    return this.repo.restore(id, {
      totalDays,
    });
  }
}
