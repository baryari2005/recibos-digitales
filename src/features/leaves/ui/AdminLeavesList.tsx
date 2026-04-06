"use client";

import { useState } from "react";
import { LeaveAttachmentDialog } from "./LeaveAttachmentDialog";
import { GenericListWithTable } from "@/components/data-display/table/GenericListWithTable";
import { GenericDataTable } from "@/components/data-display/table/GenericDataTable";
import { PendingLeave } from "../hooks/usePendingApprovals";
import { adminLeaveColumns } from "./adminLeaveColumns";

type Props = {
  type?: "VACACIONES" | "OTHER";
};

type PendingLeavesResponse = {
  data?: PendingLeave[];
  meta?: {
    total?: number;
    pageCount?: number;
  };
};

export function AdminLeavesList({ type }: Props) {
  const [refreshVersion, setRefreshVersion] = useState(0);

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
      <GenericListWithTable<PendingLeave>
        endpoint={
          type === "VACACIONES"
            ? `/admin/leaves/pending?type=${type}`
            : "/admin/leaves/pending"
        }
        columns={adminLeaveColumns(
          () => setRefreshVersion((v) => v + 1),
          type,
          handleOpenAttachment
        )}
        refreshToken={refreshVersion}
        pageSize={10}
        paramNames={{
          search: "q",
          page: "page",
          limit: "pageSize",
          sortBy: "sortBy",
          sortDir: "sortDir",
        }}
        responseAdapter={(raw) => {
          const typed = raw as PendingLeavesResponse;

          return {
            items: typed.data ?? [],
            total: typed.meta?.total ?? 0,
            pageCount: typed.meta?.pageCount,
          };
        }}
        DataTableComponent={(props) => (
          <GenericDataTable
            {...props}
            searchPlaceholder="Buscar por empleado, tipo o estado"
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