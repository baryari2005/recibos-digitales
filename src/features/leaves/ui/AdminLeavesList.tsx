// AdminLeavesList.tsx
"use client";

import { useEffect, useState } from "react";
import { GenericListWithTable } from "@/components/dashboard/GenericListWithTable";
import { GenericDataTable } from "@/components/dashboard/GenericDataTable";
import { PendingLeave } from "../hooks/usePendingApprovals";
import { adminLeaveColumns } from "./adminLeaveColumns";

type Props = {
  type?: "VACACIONES" | "OTHER";
};

export function AdminLeavesList({ type }: Props) {
  const [refreshVersion, setRefreshVersion] = useState(0);

  return (
    <GenericListWithTable<PendingLeave>
      endpoint={
        type
          ? `/admin/leaves/pending?type=${type}`
          : "/admin/leaves/pending"
      }
      columns={adminLeaveColumns(() =>
        setRefreshVersion(v => v + 1)
      )}
      refreshToken={refreshVersion}
      pageSize={10}
      paramNames={{
        search: "q",
        page: "page",
        limit: "pageSize",
        sortBy: "sortBy",
        sortDir: "sortDir",
      }}
      responseAdapter={(raw) => ({
        items: raw?.data ?? [],
        total: raw?.meta?.total ?? 0,
        pageCount: raw?.meta?.pageCount,
      })}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder="Buscar por empleado, tipo o estado"
        />
      )}
    />
  );
}
