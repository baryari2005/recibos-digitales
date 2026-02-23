import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { LeaveItem } from "../hooks/useLeaves";
import { LEAVE_STATUS_STYLES } from "./leaveStatus";
import { LeaveActionsCell } from "./LeaveActionsCell";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export const leaveColumns = (
  onRefresh: () => void
): ColumnDef<LeaveItem>[] => [
    {
      accessorKey: "type",
      header: "Tipo",
    },
    {
      accessorKey: "startYmd",
      header: "Desde",
    },
    {
      accessorKey: "endYmd",
      header: "Regreso",
    },
    {
      accessorKey: "daysCount",
      header: "Días",
      cell: ({ row }) => (
        <div className="text-center">{row.original.daysCount}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status as keyof typeof LEAVE_STATUS_STYLES;
        const reason = row.original.note;

        const badge = (
          <Badge variant="outline" className={`font-medium ${LEAVE_STATUS_STYLES[status]}`}>
            {status}
          </Badge>
        );

        if (status !== "RECHAZADO" || !reason?.trim()) return badge;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{badge}</TooltipTrigger>

              <TooltipContent className="max-w-xs p-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 " />
                  <span className="text-sm font-medium">Motivo</span>
                </div>

                <p className="mt-1 text-xs  leading-relaxed">
                  {reason}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <LeaveActionsCell
          leave={row.original}
          onRefresh={onRefresh}
        />
      ),
    },
  ];
