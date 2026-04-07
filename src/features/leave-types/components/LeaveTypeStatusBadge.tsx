type Props = {
  isActive: boolean;
};

export function LeaveTypeStatusBadge({ isActive }: Props) {
  return isActive ? (
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
      Activo
    </span>
  ) : (
    <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
      Inactivo
    </span>
  );
}
