import { LeaveType, LeaveStatus } from "@prisma/client";

export type CreateLeaveDTO = {
  type: LeaveType;
  startYmd: string;
  endYmd: string;
  daysCount: number;
  note?: string;
};

export type LeaveListItemDTO = {
  id: string;
  type: LeaveType;
  status: LeaveStatus;
  startYmd: string;
  endYmd: string;
  daysCount: number;
  createdAt: Date;
};
