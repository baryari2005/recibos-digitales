// src/app/(dashboard)/users/UserList.tsx
"use client";

import { useMemo, useState } from "react";
import { GenericDataTable } from "../dashboard/GenericDataTable";
import { GenericListWithTable } from "../dashboard/GenericListWithTable";
import { getUserColumns, UserRow } from "@/components/users/columns";

interface Props {
  search?: string;
  refresh?: any;
}

export function UserList({ search = "", refresh }: Props) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const endPoint = `/users`;

  const columns = useMemo(
    () => getUserColumns(() => setRefreshVersion((v) => v + 1)),
    []
  );

  if (process.env.NODE_ENV !== "production") {
    console.log("[UserList] endpoint →", endPoint);
  }

  return (
    <GenericListWithTable<UserRow>
      endpoint={endPoint}
      columns={columns}
      externalSearch={search}
      refreshToken={`${refresh ?? ""}-${refreshVersion}`} // fuerza refetch al borrar
      pageSize={10}      
      paramNames={{ search: "q", page: "page", limit: "pageSize", sortBy: "sortBy", sortDir: "sortDir" }}      
      responseAdapter={(raw) => ({
        items: raw?.data ?? [],
        total: raw?.meta?.total ?? 0,
        pageCount: raw?.meta?.pageCount,
      })}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder="Buscar por nombre, usuario o email"
        />
      )}
    />
  );
}
