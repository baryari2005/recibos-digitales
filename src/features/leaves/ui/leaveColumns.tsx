import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { LeaveItem } from "../hooks/useLeaves";
import { LEAVE_STATUS_STYLES } from "./leaveStatus";
import { LeaveActionsCell } from "./LeaveActionsCell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Paperclip } from "lucide-react";

type OpenAttachmentParams = {
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export const leaveColumns = (
  onRefresh: () => void,
  type?: "VACACIONES" | "OTHER",
  onPreviewAttachment?: (params: OpenAttachmentParams) => void
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
    id: "attachments",
    header: "Adjunto",
    cell: ({ row }) => {
      const attachments = row.original.attachments ?? [];

      if (!attachments.length) {
        return <span className="text-muted-foreground">—</span>;
      }

      const file = attachments[0];

      return (
        <button
          type="button"
          onClick={() =>
            onPreviewAttachment?.({
              fileUrl: file.fileUrl,
              fileName: file.fileName,
              mimeType: file.mimeType,
            })
          }
          className="inline-flex items-center gap-2 text-sm text-[#008C93] underline"
          title={file.fileName}
        >
          <Paperclip className="h-4 w-4" />
          <span className="max-w-[160px] truncate">
            {file.fileName || "Ver adjunto"}
          </span>
        </button>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status as keyof typeof LEAVE_STATUS_STYLES;
      const reason = row.original.note;

      const badge = (
        <Badge
          variant="outline"
          className={`font-medium ${LEAVE_STATUS_STYLES[status]}`}
        >
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
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Motivo</span>
              </div>

              <p className="mt-1 text-xs leading-relaxed">{reason}</p>
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
        type={type}
        onRefresh={onRefresh}
      />
    ),
  },
];