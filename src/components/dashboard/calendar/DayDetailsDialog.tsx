// components/dashboard/calendar/DayDetailsDialog.tsx
"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Gift, Cake } from "lucide-react";

type Holiday = { date: string; name: string };
export type Bday = { id: string; fullName: string; position?: string | null; date: string };

export function DayDetailsDialog({
  open,
  onOpenChange,
  date,
  holidays = [],
  birthdays = [],
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: Date | null;
  holidays?: Holiday[];
  birthdays?: Bday[];
}) {
  const title = date ? `Detalles del día ${format(date, "d 'de' MMMM", { locale: es })}` : "Detalles";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-2 font-medium">
              <Cake className="h-4 w-4" /> Cumpleaños
            </div>
            <div className="mt-2 space-y-2">
              {birthdays.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay cumpleaños este día.</p>
              ) : (
                birthdays.map(b => (
                  <div key={b.id} className="text-sm">
                    <span className="font-medium">{b.fullName}</span>
                    {b.position && <span className="text-muted-foreground"> — {b.position}</span>}
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 font-medium">
              <Gift className="h-4 w-4" /> Feriado
            </div>
            <div className="mt-2 space-y-2">
              {holidays.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay feriado este día.</p>
              ) : (
                holidays.map((h, i) => (
                  <div key={`${h.date}-${i}`} className="text-sm">{h.name}</div>
                ))
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
