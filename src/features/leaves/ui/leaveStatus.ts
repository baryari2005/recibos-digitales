export type LeaveStatus =
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO"
  | "CANCELADO";

export const LEAVE_STATUS_STYLES: Record<LeaveStatus, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-300",
  APROBADO: "bg-green-100 text-green-800 border-green-300",
  RECHAZADO: "bg-red-100 text-red-800 border-red-300",
  CANCELADO: "bg-blue-100 text-blue-800 border-blue-300",
};