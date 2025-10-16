// src/components/users/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeleteUserButton } from "./DeleteUserButton";
import { buildActionsColumn } from "../dashboard/BuildActionsColumn";

export type UserRow = {
  id: string;
  userId: string;
  email: string;
  nombre?: string | null;
  apellido?: string | null;
  avatarUrl?: string | null;
  rol?: { id: number; nombre: string } | null;
};

// Exportá una función para poder pasar onDeleted
export const getUserColumns = (onDeleted?: () => void): ColumnDef<UserRow>[] => [
  {
    id: "avatar",
    header: "Avatar",
    cell: ({ row }) => {
      const display =
        [row.original.nombre, row.original.apellido].filter(Boolean).join(" ") ||
        row.original.userId;
      const initials = display.slice(0, 2).toUpperCase();
      const imageUrl = row.original.avatarUrl ?? undefined;

      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={imageUrl} alt={display} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      );
    },
    enableSorting: false,
  },
  { accessorKey: "userId", header: "Usuario", enableSorting: true },
  {
    accessorKey: "nombre",
    header: "Nombre",
    enableSorting: true,
    cell: ({ row }) =>
      row.original.nombre ?? <span className="italic text-muted-foreground">—</span>,
  },
  {
    accessorKey: "apellido",
    header: "Apellido",
    enableSorting: true,
    cell: ({ row }) =>
      row.original.apellido ?? <span className="italic text-muted-foreground">—</span>,
  },
  { accessorKey: "email", header: "Email", enableSorting: true },
  {
    id: "rol",
    header: "Rol",
    cell: ({ row }) =>
      row.original.rol?.nombre ?? (
        <span className="italic text-muted-foreground">Sin rol</span>
      ),
    enableSorting: false,
  },  
  buildActionsColumn({ component: "users", label: "usuario", onDeleted }),
];
