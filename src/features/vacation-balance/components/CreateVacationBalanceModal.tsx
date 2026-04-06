"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useUsers } from "@/features/users/hooks/useUsers";
import { CalendarCog, Loader2, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatMessage } from "@/utils/formatters";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSave: (payload: {
    userId: string;
    year: number;
    totalDays: number;
  }) => Promise<void>;
};

export function CreateVacationBalanceModal({
  open,
  loading,
  onClose,
  onSave,
}: Props) {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [userId, setUserId] = useState("");
  const [year, setYear] = useState(currentYear);
  const [totalDays, setTotalDays] = useState(14);

  const { users, isLoading } = useUsers();

  useEffect(() => {
    if (!open) return;

    setUserId("");
    setYear(currentYear);
    setTotalDays(14);
  }, [open, currentYear]);

  async function save() {
    await onSave({
      userId,
      year,
      totalDays,
    });

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
            Asignar saldo
          </DialogTitle>

          <Separator className="mt-4 mb-4" />

          <DialogDescription className="text-sm-plus justify-center">
            Asignar saldo de vacaciones por usuario
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 px-5 pb-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Empleado</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger className="h-11 rounded border pr-3 w-full">
                <SelectValue
                  placeholder={
                    isLoading
                      ? "Cargando empleados..."
                      : "Seleccionar empleado"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.apellido}, {u.nombre}
                    {u.legajo?.numeroLegajo
                      ? ` (Legajo ${u.legajo.numeroLegajo})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Año</Label>
            <Input
              type="number"
              className="h-11 pr-4 rounded"
              value={year}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Días asignados</Label>
            <Input
              type="number"
              className="h-11 pr-4 rounded"
              value={totalDays}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setTotalDays(Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter className="px-5 py-3 bg-muted/40 border-t rounded-none">
          <DialogClose asChild>
            <Button className="h-11 rounded" variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </DialogClose>

          <Button
            onClick={save}
            disabled={loading || isLoading || !userId}
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