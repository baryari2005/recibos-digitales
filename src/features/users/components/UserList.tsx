"use client";

import { useMemo, useState } from "react";

import { useCan } from "@/hooks/useCan";
import { GenericListWithTable } from "@/components/data-display/table/GenericListWithTable";
import { GenericDataTable } from "@/components/data-display/table/GenericDataTable";
import { getUserColumns } from "./columns";
import { UserRow } from "../types/types";

interface Props {
  search?: string;
  refresh?: string | number | boolean | null | undefined;
}

type PaginatedResponse<T> = {
  data?: T[];
  meta?: {
    total?: number;
    pageCount?: number;
  };
};

export function UserList({ search = "", refresh }: Props) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const endpoint = "/users";

  const canDelete = useCan("usuarios", "eliminar");
  const canEdit = useCan("usuarios", "editar");

  const columns = useMemo(
    () =>
      getUserColumns(
        () => setRefreshVersion((v) => v + 1),
        canDelete,
        canEdit
      ),
    [canDelete, canEdit]
  );

  if (process.env.NODE_ENV !== "production") {
    console.log("[UserList] endpoint →", endpoint);
  }

  return (
    <GenericListWithTable<UserRow>
      endpoint={endpoint}
      columns={columns}
      externalSearch={search}
      refreshToken={`${String(refresh ?? "")}-${refreshVersion}`}
      pageSize={10}
      paramNames={{
        search: "q",
        page: "page",
        limit: "pageSize",
        sortBy: "sortBy",
        sortDir: "sortDir",
      }}
      responseAdapter={(raw: unknown) => {
        const typed = raw as PaginatedResponse<UserRow>;

        return {
          items: typed.data ?? [],
          total: typed.meta?.total ?? 0,
          pageCount: typed.meta?.pageCount,
        };
      }}
      DataTableComponent={(props) => (
        <GenericDataTable
          {...props}
          searchPlaceholder="Buscar por nombre, usuario o email"
        />
      )}
    />
  );
}