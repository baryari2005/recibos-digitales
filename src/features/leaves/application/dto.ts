import { LeaveStatus } from "@prisma/client";

export type CreateLeaveDTO = {
  type: string;
  startYmd: string;
  endYmd: string;
  daysCount: number;
  note?: string;
};

export type LeaveListItemDTO = {
  id: string;
  type: string;
  status: LeaveStatus;
  startYmd: string;
  endYmd: string;
  daysCount: number;
  createdAt: Date;
};
