import { VacationBalanceRepository } from "../infrastructure/vacation-balance.prisma-repository";

export class UpdateVacationBalanceUseCase {
  constructor(private readonly repo: VacationBalanceRepository) {}

  async execute(
    id: string,
    data: { totalDays?: number; usedDays?: number }
  ) {
    if (data.totalDays !== undefined && data.totalDays < 0) {
      throw new Error("INVALID_TOTAL_DAYS");
    }

    if (data.usedDays !== undefined && data.usedDays < 0) {
      throw new Error("INVALID_USED_DAYS");
    }

    return this.repo.update(id, data);
  }
}
