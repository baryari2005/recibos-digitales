"use client";

import { useState } from "react";
import { GenericListWithTable } from "@/components/data-display/table/GenericListWithTable";
import { GenericDataTable } from "@/components/data-display/table/GenericDataTable";
import { leaveColumns } from "./leaveColumns";
import { LeaveItem } from "../hooks/useLeaves";
import { LeaveAttachmentDialog } from "./LeaveAttachmentDialog";

type Props = {
  type?: "VACACIONES" | "OTHER";
  refreshToken?: number;
};

type LeavesResponse = {
  data?: LeaveItem[];
  meta?: {
    total?: number;
    pageCount?: number;
  };
};

export function LeavesList({ type, refreshToken }: Props) {
  const [internalRefresh, setInternalRefresh] = useState(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{
    fileUrl: string | null;
    fileName: string | null;
    mimeType: string | null;
  }>({
    fileUrl: null,
    fileName: null,
    mimeType: null,
  });

  const handleOpenAttachment = (params: {
    fileUrl: string;
    fileName?: string | null;
    mimeType?: string | null;
  }) => {
    setSelectedAttachment({
      fileUrl: params.fileUrl,
      fileName: params.fileName ?? "Adjunto",
      mimeType: params.mimeType ?? null,
    });
    setPreviewOpen(true);
  };

  return (
    <>
      <GenericListWithTable<LeaveItem>
        endpoint={
          type
            ? `/leaves?type=${type}`
            : "/leaves"
        }
        columns={leaveColumns(
          () => setInternalRefresh((v) => v + 1),
          type,
          handleOpenAttachment
        )}
        refreshToken={`${refreshToken ?? 0}-${internalRefresh}`}
        pageSize={7}
        paramNames={{
          search: "q",
          page: "page",
          limit: "pageSize",
          sortBy: "sortBy",
          sortDir: "sortDir",
        }}
        responseAdapter={(raw) => {
          const typed = raw as LeavesResponse;

          return {
            items: typed.data ?? [],
            total: typed.meta?.total ?? 0,
            pageCount: typed.meta?.pageCount,
          };
        }}
        DataTableComponent={(props) => (
          <GenericDataTable
            {...props}
            searchPlaceholder="Buscar por tipo o estado"
          />
        )}
      />

      <LeaveAttachmentDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        fileUrl={selectedAttachment.fileUrl}
        fileName={selectedAttachment.fileName}
        mimeType={selectedAttachment.mimeType}
      />
    </>
  );
}