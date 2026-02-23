"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeaveTypes } from "../hooks/useLeaveTypes";
import { LeaveDateRangePicker } from "./LeaveDateRangePicker";
import { DateRange } from "react-day-picker";
import { calcDaysInclusive } from "../domain/calcDays";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function RequestLeaveDialog({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<string | undefined>();
  const [range, setRange] = useState<DateRange | undefined>();
  const [note, setNote] = useState("");

  const { types } = useLeaveTypes();

  const days = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return calcDaysInclusive(range.from, range.to);
  }, [range]);

  const canContinue =
    Boolean(type) &&
    Boolean(range?.from) &&
    Boolean(range?.to) &&
    days > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar vacaciones</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de licencia" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.code} value={t.code}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <LeaveDateRangePicker value={range} onChange={setRange} />

            {days > 0 && (
              <p className="text-sm text-muted-foreground">
                Total de días: <strong>{days}</strong>
              </p>
            )}

            <div className="flex justify-end">
              <Button disabled={!canContinue} onClick={() => setStep(2)}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Textarea
              placeholder="Observaciones (opcional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Volver
              </Button>
              <Button onClick={onSuccess}>
                Enviar solicitud
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
