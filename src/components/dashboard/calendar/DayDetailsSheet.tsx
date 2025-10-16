// components/dashboard/calendar/DayDetailsSheet.tsx
"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Gift, Cake, X, TreePalm } from "lucide-react";

// 👉 shadcn/ui
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";


type Holiday = { date: string; name: string };
export type Bday = { id: string; fullName: string; position?: string | null; date: string };

export function DayDetailsSheet({
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* podés ajustar side a "right" | "left" */}
      <SheetContent
        side="right"
        className="w-[420px] sm:w-[480px] p-0 flex flex-col [&>button]:hidden"
      >
        {/* Header fijo */}
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">{title}</SheetTitle>
            <SheetClose
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Cumpleaños */}
          <section>
            <div className="flex items-center gap-2 justify-baseline font-medium">
              <Cake className="h-6 w-6" />Cumpleaños
            </div>
            <div className="mt-3 space-y-3">
              {birthdays.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay cumpleaños este día.</p>
              ) : (
                birthdays.map((b) => (
                  <div key={b.id} className="flex items-start gap-3">
                    {/* Iniciales redonditas, opcional */}
                    <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                      {getInitials(b.fullName)}
                    </div>
                    <div className="text-sm leading-tight items-center mt-2">
                      <div className="font-medium">{b.fullName}</div>
                      {/* {b.position && (
                        <div className="text-muted-foreground">{b.position}</div>
                      )} */}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Feriados */}
          <section>
            <div className="flex items-center gap-2 font-medium">
              <TreePalm className="h-6 w-6" /> Feriado
            </div>
            <div className="mt-3 space-y-2">
              {holidays.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay feriado este día.</p>
              ) : (
                holidays.map((h, i) => (
                  <div key={`${h.date}-${i}`} className="text-sm">
                    {h.name}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Helpers */
function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
