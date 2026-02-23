"use client";

import { GenericListWithTable } from "@/components/dashboard/GenericListWithTable";
import { GenericDataTable } from "@/components/dashboard/GenericDataTable";
import { adminVacationBalanceColumns } from "./adminVacationBalanceColumns";
import { VacationBalanceItem } from "../hooks/useVacationBalances";

type Props = {
  refreshToken: number;
  onEdit: (item: VacationBalanceItem) => void;
  onDeleted: () => void;
};

export function AdminVacationBalancesList({
  refreshToken,
  onEdit,
  onDeleted,
}: Props) {
  return (
    <GenericListWithTable<VacationBalanceItem>
      endpoint="/admin/vacation-balance"
      columns={adminVacationBalanceColumns({
        onEdit,
        onDeleted,
      })}
      refreshToken={refreshToken}
      pageSize={10}
      paramNames={{
        search: "q",
        page: "page",
        limit: "pageSize",
      }}
      responseAdapter={(raw) => ({
        items: raw?.data ?? [],
        total: raw?.meta?.total ?? raw?.data?.length ?? 0,
        pageCount: raw?.meta?.pageCount,
      })}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder="Buscar empleado"
        />
      )}
    />
  );
}
