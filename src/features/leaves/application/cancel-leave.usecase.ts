import { LeaveRepository } from "../infrastructure/leave.prisma-repository";
import {
  LeaveCannotBeCancelledError,
  LeaveNotFoundError,
} from "../domain/errors";
import { LeaveStatus } from "@prisma/client";

export class CancelLeaveUseCase {
  constructor(private readonly repo: LeaveRepository) {}

  async execute(userId: string, leaveId: string) {
    const leave = await this.repo.findById(leaveId);

    if (!leave || leave.userId !== userId) {
      throw new LeaveNotFoundError();
    }

    if (leave.status !== LeaveStatus.PENDIENTE) {
      throw new LeaveCannotBeCancelledError();
    }

    return this.repo.cancel(leaveId);
  }
}
