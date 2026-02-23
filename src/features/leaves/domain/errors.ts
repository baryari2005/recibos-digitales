export class LeaveError extends Error {}

export class InvalidLeaveDatesError extends LeaveError {}
export class LeaveNotFoundError extends LeaveError {}
export class LeaveCannotBeCancelledError extends LeaveError {}
