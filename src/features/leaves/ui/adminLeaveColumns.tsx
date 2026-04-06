"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PendingLeave } from "../hooks/usePendingApprovals";
import { AdminLeaveActionsCell } from "./AdminLeaveActionsCell";
import { Paperclip } from "lucide-react";

function formatFileSize(size?: number | null) {
  if (!size) return "";

  const mb = size / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;

  const kb = size / 1024;
  return `${kb.toFixed(0)} KB`;
}

type OpenAttachmentParams = {
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export function adminLeaveColumns(
  onRefresh: () => void,
  type?: "VACACIONES" | "OTHER",
  onPreviewAttachment?: (params: OpenAttachmentParams) => void
): ColumnDef<PendingLeave>[] {
  return [
    {
      header: "Empleado",
      accessorKey: "user",
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
      accessorKey: "type",
      header: "Tipo",
    },
    {
      accessorKey: "startYmd",
      header: "Desde",
    },
    {
      accessorKey: "endYmd",
      header: "Hasta",
    },
    {
      accessorKey: "daysCount",
      header: "Días",
      cell: ({ row }) => (
        <div className="text-center">{row.original.daysCount}</div>
      ),
    },
    {
      accessorKey: "note",
      header: "Observaciones",
      cell: ({ row }) => {
        const note = row.original.note;

        if (!note) {
          return <span className="text-muted-foreground">—</span>;
        }

        const short = note.length > 20 ? `${note.slice(0, 20)}…` : note;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help underline decoration-dotted">
                  {short}
                </span>
              </TooltipTrigger>

              <TooltipContent className="max-w-xs">
                <p className="text-sm">{note}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: "attachments",
      header: "Adjuntos",
      cell: ({ row }) => {
        const attachments = row.original.attachments ?? [];

        if (!attachments.length) {
          return <span className="text-muted-foreground">—</span>;
        }

        if (attachments.length === 1) {
          const file = attachments[0];

          return (
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() =>
                        onPreviewAttachment?.({
                          fileUrl: file.fileUrl,
                          fileName: file.fileName,
                          mimeType: file.mimeType,
                        })
                      }
                      className="max-w-[170px] truncate text-sm text-[#008C93] underline text-left"
                    >
                      {file.fileName}
                    </button>
                  </TooltipTrigger>

                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-2">
            {attachments.map((file) => (
              <div key={file.id} className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />

                <button
                  type="button"
                  onClick={() =>
                    onPreviewAttachment?.({
                      fileUrl: file.fileUrl,
                      fileName: file.fileName,
                      mimeType: file.mimeType,
                    })
                  }
                  className="max-w-[150px] truncate text-sm text-[#008C93] underline text-left"
                  title={file.fileName}
                >
                  {file.fileName}
                </button>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: () => (
        <Badge className="bg-yellow-100 text-yellow-800">PENDIENTE</Badge>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <AdminLeaveActionsCell
          item={row.original}
          type={type}
          onRefresh={onRefresh}
        />
      ),
    },
  ];
}