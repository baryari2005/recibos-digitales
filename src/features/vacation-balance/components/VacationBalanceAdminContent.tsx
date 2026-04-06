"use client";

import { CardContent } from "@/components/ui/card";
import { AdminVacationBalancesList } from "@/features/vacation-balance/components/AdminVacationBalancesList";
import type { Props } from "@/features/vacation-balance/types/types";

export function VacationBalanceAdminContent({
  refreshToken,
  onEdit,
  onDeleted,
}: Props) {
  return (
    <CardContent>
      <AdminVacationBalancesList
        refreshToken={refreshToken}
        onEdit={onEdit}
        onDeleted={onDeleted}
      />
    </CardContent>
  );
}