"use client";

import { GenericListWithTable } from "@/components/data-display/table/GenericListWithTable";
import { GenericDataTable } from "@/components/data-display/table/GenericDataTable";
import { Props, VacationBalanceItem } from "../types/types";
import { adminVacationBalanceColumns } from "./columns";

type VacationBalanceResponse = {
  data?: VacationBalanceItem[];
  meta?: {
    total?: number;
    pageCount?: number;
  };
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
            responseAdapter={(raw) => {
        const typed = raw as VacationBalanceResponse;

        return {
          items: typed.data ?? [],
          total: typed.meta?.total ?? 0,
          pageCount: typed.meta?.pageCount,
        };
      }}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder="Buscar empleado"
        />
      )}
    />
  );
}