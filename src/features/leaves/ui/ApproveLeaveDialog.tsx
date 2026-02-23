"use client";

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
import { Loader2, SquareCheckBig } from "lucide-react";
import type { PendingLeave } from "../hooks/usePendingApprovals";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  item: PendingLeave;
};

export function ApproveLeaveDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
  item,
}: Props) {
  const fullName = `${item.user.nombre} ${item.user.apellido}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-2">
          <DialogTitle className="text-sm-plus font-semibold flex items-center">
            <SquareCheckBig className="w-4 h-4 mr-2" />
            ¿Aprobar solicitud?
          </DialogTitle>

          <Separator className="mt-4 mb-4" />

          <DialogDescription className="text-sm-plus">
            Se aprobará la solicitud de {fullName}.
          </DialogDescription>

          <div className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{item.type}</span>{" "}
            • {item.startYmd} → {item.endYmd} •{" "}
            <span className="font-medium text-foreground">{item.daysCount}</span>{" "}
            días
          </div>
        </DialogHeader>

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
            disabled={loading}
            onClick={onConfirm}
            className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Procesando...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <SquareCheckBig className="w-4 h-4" />
                Aprobar
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}