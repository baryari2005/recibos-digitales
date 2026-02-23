"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CancelLeaveDialog } from "./CancelLeaveDialog";
import { cancelLeave } from "../hooks/cancelLeave";
import { LeaveItem } from "../hooks/useLeaves";

type Props = {
  leave: LeaveItem;
  onRefresh?: () => void;
};

export function LeaveActionsCell({ leave, onRefresh }: Props) {
  const [open, setOpen] = useState(false);

  if (leave.status !== "PENDIENTE") return null;

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="text-red-600 hover:text-red-700 rounded"
        onClick={() => setOpen(true)}
      >
        Cancelar
      </Button>

      <CancelLeaveDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={async () => {
          await cancelLeave(leave.id);
          setOpen(false);
          onRefresh?.(); // 👈 refresh REAL
        }}
      />
    </>
  );
}
