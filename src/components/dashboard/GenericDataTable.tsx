// app/(dashboard)/components/GenericDataTable.tsx
"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

export type DataTableProps<T> = {
  data: T[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onSearchChange: (q: string) => void;
  columns: ColumnDef<T, any>[];
  sorting: SortingState;
  onSortingChange: (u: SortingState | ((old: SortingState) => SortingState)) => void;
  searchPlaceholder?: string;
};

export function GenericDataTable<T>({
  data,
  loading,
  page,
  totalPages,
  onPageChange,
  onSearchChange,
  columns,
  sorting,
  onSortingChange,
  searchPlaceholder = "Buscar…",
}: DataTableProps<T>) {
  const table = useReactTable<T>({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 rounded border pl-9 pr-10"
            aria-busy={loading}
          />
          {loading && (
            <Loader2
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground pointer-events-none"
              aria-label="Buscando…"
            />
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort();
                  const dir = h.column.getIsSorted(); // false | 'asc' | 'desc'
                  return (
                    <th key={h.id} className="p-3 text-left select-none">
                      <button
                        type="button"
                        onClick={h.column.getToggleSortingHandler()}
                        className={`inline-flex items-center gap-1 ${canSort ? "hover:underline" : ""}`}
                        disabled={!canSort}
                        aria-label="Ordenar"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {canSort && (
                          <span className="text-xs text-muted-foreground">
                            {dir === "asc" ? "▲" : dir === "desc" ? "▼" : ""}
                          </span>
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3 flex items-center text-muted-foreground" colSpan={columns.length}>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cargando…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={columns.length}>Sin resultados</td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-1 text-sm">
        <div>Página {page} de {totalPages}</div>
        <div className="flex items-center gap-2">
          <Button
            className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
          >
            Anterior
          </Button>
          <Button
            className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || loading}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
