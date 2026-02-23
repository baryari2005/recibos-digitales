import { prisma } from "@/lib/db";
import { LeaveType, VacationBalance } from "@prisma/client";
import { CreateLeaveDTO } from "./dto";
import { LeaveRepository } from "../infrastructure/leave.prisma-repository";

export class CreateLeaveUseCase {
  constructor(private readonly repo: LeaveRepository) {}

  async execute(userId: string, dto: CreateLeaveDTO) {
    // 👇 solo validamos vacaciones
    if (dto.type === LeaveType.VACACIONES) {      
      const daysRequested = dto.daysCount;
      const year = new Date(dto.startYmd).getFullYear();

      // ✅ (2) Si hay pendiente, NO deja crear otra
      const pending = await this.repo.findPendingVacationByUser(userId);
      if (pending) {
        const err = Object.assign(new Error("PENDING_VACATION_EXISTS"), {
          pending: { id: pending.id, startYmd: pending.startYmd, endYmd: pending.endYmd },
        });
        throw err;
      }

      // ✅ (1) No permitir superposición (contra PENDIENTE o APROBADO)
      const overlap = await this.repo.findOverlappingVacationsByUser({
        userId,
        startYmd: dto.startYmd,
        endYmd: dto.endYmd,
      });

      if (overlap) {
        const err = Object.assign(new Error("VACATION_DATE_OVERLAP"), {
          overlap: { id: overlap.id, startYmd: overlap.startYmd, endYmd: overlap.endYmd, status: overlap.status },
        });
        throw err;
      }      

      const balances = await prisma.vacationBalance.findMany({
        where: {
          userId,
          year: { lte: year },
        },
      });

      const available = balances.reduce(
        (acc: number, b: VacationBalance) => acc + (b.totalDays - b.usedDays),
        0
      );

      if (available < daysRequested) {
        throw new Error("INSUFFICIENT_VACATION_BALANCE");
      }
    }

    return this.repo.create({
      userId,
      ...dto,
    });
  }
}
