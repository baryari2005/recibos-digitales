"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { VacationBalanceItem } from "../hooks/useVacationBalances";
import { TableActions, TableAction } from "@/components/ui/table-actions";

type Params = {
  onEdit: (item: VacationBalanceItem) => void;
  onDeleted: () => void;
};

export function adminVacationBalanceColumns({
  onEdit,
  onDeleted,
}: Params): ColumnDef<VacationBalanceItem>[] {
  const token = localStorage.getItem("token");

  return [
    {
      header: "Empleado",
      cell: ({ row }) => {
        const u = row.original.user;
        return (
          <div>
            <div className="font-medium">
              {u.nombre} {u.apellido}
            </div>
            {u.legajo?.numeroLegajo && (
              <div className="text-xs text-muted-foreground">
                Legajo {u.legajo.numeroLegajo}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "year",
      header: "Año",
    },
    {
      accessorKey: "totalDays",
      header: "Asignados",
    },
    {
      accessorKey: "usedDays",
      header: "Usados",
    },
    {
      header: "Disponibles",
      cell: ({ row }) =>
        row.original.totalDays - row.original.usedDays,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const item = row.original;
        
        const actions: TableAction[] = [
          {
            label: "Editar",
            icon: <Pencil className="w-4 h-4" />,
            onClick: () => onEdit(item), // 👉 abre tu modal lindo
          },
          {
            label: "Eliminar",
            icon: <Trash2 className="w-4 h-4" />,
            confirmTitle: "¿Eliminar saldo de vacaciones?",
            confirmDescription: `Se eliminará el saldo ${item.year} de ${item.user.nombre} ${item.user.apellido}.`,
            confirmActionLabel: "Eliminar",
            confirmIcon: <Trash2 className="w-4 h-4" />,
            onConfirm: async () => {
              await axios.delete(`/api/admin/vacation-balance/${item.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              toast.success("Saldo eliminado correctamente");
              onDeleted();
            },
          },
        ];

        return <TableActions id={item.id} actions={actions} />;
      },
    },
  ];
}
