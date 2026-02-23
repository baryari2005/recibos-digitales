"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarCog, CalendarDays, Loader2 } from "lucide-react";
import axios from "axios";
import { useState } from "react";

type Props = {
  open: boolean;
  year: number;
  token: string | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function BulkCreateVacationBalanceDialog({
  open,
  year,
  token,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function confirm() {
    try {
      setLoading(true);

      await axios.post(
        "/api/admin/vacation-balance/bulk",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="px-5 pt-4 pb-2">
          <DialogTitle className="text-sm-plus font-semibold flex">
            <CalendarCog className="w-4 h-4 mr-2" />
            Crear saldos masivos
          </DialogTitle>

          <Separator className="mt-4 mb-4" />

          <DialogDescription className="text-sm-plus justify-center">
            Se crearán los saldos de vacaciones del año{" "}
            <span className="font-medium text-foreground">{year}</span> para
            todos los empleados que no lo tengan cargado.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="px-5 py-3 bg-muted/40 border-t rounded-none">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="h-11 rounded"
              disabled={loading}
            >
              Cancelar
            </Button>
          </DialogClose>

          <Button
            onClick={confirm}
            disabled={loading}
            className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Procesando...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Crear saldos
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
