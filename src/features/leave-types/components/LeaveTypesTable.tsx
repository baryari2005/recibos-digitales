"use client";

import { useMemo } from "react";
import { useCan } from "@/hooks/useCan";
import { GenericListWithTable } from "@/components/data-display/table/GenericListWithTable";
import { GenericDataTable } from "@/components/data-display/table/GenericDataTable";
import { getLeaveTypeColumns } from "./columns";
import type {
  LeaveTypeItem,
  LeaveTypesListProps,
} from "../types/leave-type.type";

type LeaveTypeResponse = {
  data?: LeaveTypeItem[];
  meta?: {
    total?: number;
    pageCount?: number;
  };
};

export function LeaveTypesList({
  search = "",
  refresh,
}: LeaveTypesListProps) {
  const endpoint = "/leave-types";
  const canEdit = useCan("tipo_licencia", "editar");

  const columns = useMemo(
    () => getLeaveTypeColumns(canEdit),
    [canEdit]
  );

  return (
    <GenericListWithTable<LeaveTypeItem>
      endpoint={endpoint}
      columns={columns}
      externalSearch={search}
      refreshToken={`${refresh ?? ""}`}
      pageSize={10}
      paramNames={{
        search: "q",
        page: "page",
        limit: "pageSize",
        sortBy: "sortBy",
        sortDir: "sortDir",
      }}
      responseAdapter={(raw) => {
        const typed = raw as LeaveTypeResponse;

        return {
          items: typed.data ?? [],
          total: typed.meta?.total ?? 0,
          pageCount: typed.meta?.pageCount,
        };
      }}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder="Buscar por código o etiqueta"
        />
      )}
    />
  );
}
