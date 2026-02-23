"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, SquareX } from "lucide-react";
import type { PendingLeave } from "../hooks/usePendingApprovals";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
  item: PendingLeave;
};

export function RejectLeaveDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  item,
}: Props) {
  const [reason, setReason] = useState("");
  const fullName = `${item.user.nombre} ${item.user.apellido}`;

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  function handleConfirm() {
    onConfirm(reason);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-2">
          <DialogTitle className="text-sm-plus font-semibold flex items-center">
            <SquareX className="w-4 h-4 mr-2" />
            ¿Rechazar solicitud?
          </DialogTitle>

          <Separator className="mt-4 mb-4" />

          <DialogDescription className="text-sm-plus">
            Se rechazará la solicitud de {fullName}.
          </DialogDescription>

          <div className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{item.type}</span>{" "}
            • {item.startYmd} → {item.endYmd} •{" "}
            <span className="font-medium text-foreground">{item.daysCount}</span>{" "}
            días
          </div>
        </DialogHeader>

        <div className="grid gap-3 px-5 pb-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Podés indicar el motivo del rechazo (opcional).
            </p>
            <Textarea
              placeholder="Motivo (opcional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t rounded-none bg-transparent">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="h-11 rounded"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </DialogClose>

          <Button
            variant="destructive"
            disabled={loading}
            onClick={handleConfirm}
            className="h-11 rounded"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Procesando...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <SquareX className="w-4 h-4" />
                Rechazar
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}