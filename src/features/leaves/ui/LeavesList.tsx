"use client";

import { useState } from "react";
import { GenericListWithTable } from "@/components/dashboard/GenericListWithTable";
import { GenericDataTable } from "@/components/dashboard/GenericDataTable";
import { leaveColumns } from "./leaveColumns";
import { LeaveItem } from "../hooks/useLeaves";

type Props = {
  type?: "VACACIONES" | "OTHER";
  refreshToken?: number;
};

export function LeavesList({ type, refreshToken }: Props) {
  const [internalRefresh, setInternalRefresh] = useState(0);
  return (
    <GenericListWithTable<LeaveItem>
      endpoint={
        type ?
          `/leaves?type=${type}`
          : "/leaves"
      }
      columns={leaveColumns(() => 
        setInternalRefresh((v) => v + 1)
      )}
      refreshToken={`${refreshToken ?? 0}-${internalRefresh}`}
      pageSize={9}
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
          searchPlaceholder="Buscar por tipo o estado"
        />
      )}
    />
  );
}
