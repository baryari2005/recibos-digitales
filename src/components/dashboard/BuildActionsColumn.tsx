import { FileUser, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TableAction, TableActions } from "../ui/table-actions";
import { axiosInstance } from "@/lib/axios";
import { formatApiMessage } from "@/utils/formatters";


interface BuildActionsColumnOptions {
  component: string; // ejemplo: "roles"
  label: string;     // ejemplo: "rol"
  onDeleted?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  getExtraActions?: (row: any) => TableAction[];
}

export const buildActionsColumn = ({
  component,
  label,
  onDeleted,
  canEdit = true,
  canDelete = true,
  getExtraActions,
}: BuildActionsColumnOptions) => ({
  id: "actions",
  header: "Acciones",
  cell: ({ row }: { row: any }) => {
    const { id } = row.original;

    const actions: TableAction[] = [];

    if (canEdit) {
      actions.push({
        label: "Editar",
        icon: <Pencil className="w-4 h-4" />,
        href: `/${component}/${id}`,
      });
    }

    if (canDelete) {
      actions.push({
        label: "Eliminar",
        icon: <Trash2 className="w-4 h-4" />,
        confirmTitle: `¿Eliminar este ${label}?`,
        confirmDescription: `Esta acción eliminará permanentemente el ${label}. ¿Continuar?`,
        confirmActionLabel: "Eliminar",
        onConfirm: async () => {
          await axiosInstance.delete(`/users/${id}`);
          toast.success(formatApiMessage(`success.${component.slice(0, -1)}Deleted`));
          onDeleted?.();
        },
      });
    }

      actions.push({
        label: "Legajo",
        icon: <FileUser className="w-4 h-4" />,
        href: `/${component}/${id}/legajo`,
      });

    // Agregamos acciones adicionales, si existen
    if (getExtraActions) {
      actions.push(...getExtraActions(row.original));
    }

    if (actions.length === 0) return null;
    
    return <TableActions id={id.toString()} actions={actions} />;
  },
});
