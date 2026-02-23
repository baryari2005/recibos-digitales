import { LeaveRepository } from "../infrastructure/leave.prisma-repository";

export class ListLeavesUseCase {
  constructor(private readonly repo: LeaveRepository) {}

  
  async execute(userId: string) {
    return this.repo.findByUser(userId);
  }
}
