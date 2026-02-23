import { LeaveRepository } from "../infrastructure/leave.prisma-repository";

type Params = {
  q?: string;
  page: number;
  pageSize: number;
  type?: "VACACIONES" | "OTHER";
};

export class ListPendingLeavesUseCase {
  constructor(private readonly repo: LeaveRepository) {}

  async execute(params: Params) {
    return this.repo.findPendingForApproval(params);
  }
}
