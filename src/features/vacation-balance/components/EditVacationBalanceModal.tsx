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
import { CalendarCog, Loader2, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatMessage } from "@/utils/formatters";
import type { VacationBalanceItem } from "../types/types";

type Props = {
  open: boolean;
  item: VacationBalanceItem | null;
  loading: boolean;
  onClose: () => void;
  onSave: (id: string, totalDays: number) => Promise<void>;
};

export function EditVacationBalanceModal({
  open,
  onClose,
  item,
  loading,
  onSave,
}: Props) {
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (item) {
      setTotalDays(item.totalDays);
    }
  }, [item]);

  if (!item) return null;

  const { id, totalDays: initialDays } = item;

  async function save() {
    await onSave(id, totalDays);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader className="px-5 pt-4 pb-2">
          <DialogTitle className="text-sm-plus font-semibold flex">
            <CalendarCog className="w-4 h-4 mr-2" />
            Editar saldo
          </DialogTitle>

          <Separator className="mt-4 mb-4" />

          <DialogDescription className="text-sm-plus justify-center">
            Cambia el saldo actual de vacaciones
          </DialogDescription>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {item.user.nombre} {item.user.apellido} su saldo actual es de:
              <span className="font-medium text-foreground"> {initialDays} días.</span>
            </span>
          </div>
        </DialogHeader>

        <div className="grid gap-3 px-5 pb-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Días totales</Label>
            <Input
              type="number"
              className="h-11 pr-4 rounded"
              value={totalDays}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setTotalDays(Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t rounded-none bg-background">
          <DialogClose asChild>
            <Button variant="outline" className="h-11 rounded" disabled={loading}>
              Cancelar
            </Button>
          </DialogClose>

          <Button
            onClick={save}
            disabled={loading}
            className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                {formatMessage("Guardando...")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Save className="w-4 h-4" />
                Guardar
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}