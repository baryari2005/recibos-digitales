export function parseLeaveTypeId(id: string) {
  const leaveTypeId = Number(id);

  if (!Number.isInteger(leaveTypeId) || leaveTypeId <= 0) {
    return null;
  }

  return leaveTypeId;
}
