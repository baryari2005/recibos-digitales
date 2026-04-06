"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CancelLeaveDialog } from "./CancelLeaveDialog";
import { cancelLeave } from "../hooks/cancelLeave";
import { LeaveItem } from "../hooks/useLeaves";
import { useCan } from "@/hooks/useCan";

type Props = {
  leave: LeaveItem;
   type?: "VACACIONES" | "OTHER";
  onRefresh?: () => void;
};

export function LeaveActionsCell({ leave, type, onRefresh }: Props) {
  const [open, setOpen] = useState(false);
  const canCancelVacations = useCan("vacaciones", "cancelar");
  const canCancelLicenses = useCan("licencias", "cancelar");

  const canCancel =
    type === "VACACIONES" ? canCancelVacations : canCancelLicenses;

  if (leave.status !== "PENDIENTE") return null;

  return (
    <>
      {canCancel && (
        <Button
          size="sm"
          variant="ghost"
          className="rounded text-red-600 hover:text-red-700"
          onClick={() => setOpen(true)}
        >
          Cancelar
        </Button>
      )}

      <CancelLeaveDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={async () => {
          await cancelLeave(leave.id);
          setOpen(false);
          onRefresh?.();
        }}
      />
    </>
  );
}