"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Edit3 } from "lucide-react";
import type { LeaveTypeItem } from "../types/leave-type.type";
import { LeaveTypeStatusBadge } from "./LeaveTypeStatusBadge";

export function getLeaveTypeColumns(
  canEdit: boolean
): ColumnDef<LeaveTypeItem>[] {
  return [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "label",
      header: "Etiqueta",
      cell: ({ row }) => row.original.label,
    },
    {
      accessorKey: "colorHex",
      header: "Color",
      cell: ({ row }) =>
        row.original.colorHex ? (
          <div className="flex items-center gap-2">
            <span
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: row.original.colorHex }}
            />
            <span className="text-muted-foreground">{row.original.colorHex}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Sin color</span>
        ),
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => (
        <LeaveTypeStatusBadge isActive={row.original.isActive} />
      ),
    },
    {
      id: "requests",
      header: "Solicitudes",
      cell: ({ row }) => row.original._count?.requests ?? 0,
    },
    {
      id: "acciones",
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => (
        <div className="text-left">
          {canEdit ? (
            <Link
              href={`/leave-types/${row.original.id}`}
              className="text-primary hover:underline flex"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Editar
            </Link>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
  ];
}
