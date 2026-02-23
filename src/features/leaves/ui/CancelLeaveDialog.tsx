"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
};

export function CancelLeaveDialog({
  open,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-2">
          <DialogTitle className="text-sm-plus font-semibold flex items-center">            
            ¿Cancelar solicitud?
          </DialogTitle>

          <Separator className="mt-4 mb-4" />

          <DialogDescription className="text-sm-plus">
             Esta acción no se puede deshacer.  
             La solicitud quedará marcada como <strong>cancelada</strong>.
          </DialogDescription>

        </DialogHeader>

        <DialogFooter className="px-5 py-3 border-t rounded-none bg-transparent">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="h-11 rounded"
              onClick={() => onOpenChange(false)}
            >
              Volver
            </Button>
          </DialogClose>

          <Button            
            onClick={onConfirm}
            className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
          >
            Si, cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>    
  );
}
