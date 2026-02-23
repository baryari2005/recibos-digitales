"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
};

export function LeaveNotesDialog({
  open,
  value,
  onChange,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Observaciones</DialogTitle>
        </DialogHeader>

        <Textarea
          placeholder="Escribí una observación (opcional)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        <div className="flex justify-end">
          <Button onClick={onClose}>Aceptar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
