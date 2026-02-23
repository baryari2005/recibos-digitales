import { VacationBalanceRepository } from "../infrastructure/vacation-balance.prisma-repository";

type Params = {
  q?: string;
  page: number;
  pageSize: number;
};

export class ListVacationBalancesUseCase {
  constructor(private readonly repo: VacationBalanceRepository) {}

  async execute(params: Params) {
    return this.repo.findAll(params);
  }
}