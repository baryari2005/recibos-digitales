"use client";

import { useState } from "react";
import { SquareCheck, SquareX } from "lucide-react";
import { toast } from "sonner";

import { TableAction, TableActions } from "@/components/ui/table-actions";
import { ApproveLeaveDialog } from "./ApproveLeaveDialog";
import { RejectLeaveDialog } from "./RejectLeaveDialog";
import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors/getErrorMessage";
import { useCan } from "@/hooks/useCan";
import { PendingLeave } from "../hooks/usePendingApprovals";

type Props = {
  item: PendingLeave;
  type?: "VACACIONES" | "OTHER";
  onRefresh: () => void;
};

export function AdminLeaveActionsCell({ item, type, onRefresh }: Props) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const canApproveVacations = useCan("vacaciones", "aprobar");
  const canRejectVacations = useCan("vacaciones", "rechazar");

  const canApproveOther = useCan("licencias", "aprobar");
  const canRejectOther = useCan("licencias", "rechazar");

  const canApprove =
    type === "VACACIONES"
      ? canApproveVacations
      : type === "OTHER"
        ? canApproveOther
        : false;

  const canReject =
    type === "VACACIONES"
      ? canRejectVacations
      : type === "OTHER"
        ? canRejectOther
        : false;

  const actions: TableAction[] = [
    ...(canApprove
      ? [
          {
            label: "Aprobar",
            icon: <SquareCheck className="h-4 w-4" />,
            onClick: () => setApproveOpen(true),
          } satisfies TableAction,
        ]
      : []),
    ...(canReject
      ? [
          {
            label: "Rechazar",
            icon: <SquareX className="h-4 w-4" />,
            onClick: () => setRejectOpen(true),
          } satisfies TableAction,
        ]
      : []),
  ];

  async function approve() {
    try {
      setLoading(true);
      await axiosInstance.post(`/leaves/${item.id}/approve`);
      toast.success("Solicitud aprobada");
      setApproveOpen(false);
      onRefresh();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Error al aprobar."));
    } finally {
      setLoading(false);
    }
  }

  async function reject(reason: string) {
    try {
      setLoading(true);
      await axiosInstance.post(`/leaves/${item.id}/reject`, { reason });
      toast.success("Solicitud rechazada");
      setRejectOpen(false);
      onRefresh();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Error al rechazar."));
    } finally {
      setLoading(false);
    }
  }

  if (!actions.length) return null;

  return (
    <>
      <TableActions id={item.id} actions={actions} />

      {canApprove && (
        <ApproveLeaveDialog
          open={approveOpen}
          onOpenChange={setApproveOpen}
          onConfirm={approve}
          loading={loading}
          item={item}
        />
      )}

      {canReject && (
        <RejectLeaveDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          onConfirm={reject}
          loading={loading}
          item={item}
        />
      )}
    </>
  );
}