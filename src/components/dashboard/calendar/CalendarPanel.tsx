// components/dashboard/calendar/CalendarPanel.tsx
"use client";

import { useState, useMemo } from "react";
import { addMonths, format, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { CalendarGrid } from "./CalendarGrid";
import { LegendDot } from "./LegendDot";
import { useCalendarDays } from "./hooks/useCalendarDays";
import { useMonthHolidays } from "./hooks/useMonthHolidays";
import { useMonthBirthdays } from "./hooks/useMonthBirthdays";
import { format as fmt } from "date-fns";
import { DayDetailsDialog, type Bday } from "./DayDetailsDialog";
import { DayDetailsSheet } from "./DayDetailsSheet";

export function CalendarPanel() {
  const [month, setMonth] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | null>(null);

  const days = useCalendarDays(month);

  const { holidaySet, holidayByDate, loading: loadingHol, error: errHol } = useMonthHolidays(month, "AR");
  const { birthdaySet, birthdaysByDate, loading: loadingBday, error: errBday } =
    useMonthBirthdays(month);

  const selectedKey = useMemo(
    () => (selected ? fmt(selected, "yyyy-MM-dd") : null),
    [selected]
  );

  const selectedHolidays = selectedKey ? holidayByDate.get(selectedKey) ?? [] : [];
  const selectedBirthdays = selectedKey ? birthdaysByDate.get(selectedKey) ?? [] : [];


  const selectedBirthdaysBday: Bday[] = selectedBirthdays.map(r => ({
    id: r.userId,
    fullName: r.fullName,     // viene de tu hook    
    date: r.date,             // "YYYY-MM-DD"
  }));

  return (
    <Card className="border shadow-sm mb-3">
      <CardHeader className="pb-3">
        <div className="w-full flex items-center gap-2">
          {/* <  */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={() => setMonth(m => subMonths(m, 1))}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/*  Centro: "Eventos — OCTUBRE 2025"  */}
          <div className="flex-1 min-w-0 flex items-center justify-center gap-2 whitespace-nowrap">
            <span className="font-semibold">Eventos</span>
            <span><Ellipsis className="h-4 w-4"/> </span>
            <span className="text-xl font-semibold">
              {format(month, "LLLL yyyy", { locale: es }).toUpperCase()}              
            </span>
            <span><CalendarDays className="h-4 w-4" /></span>
            {loadingHol && (
              <span className="ml-2 text-muted-foreground">(cargando feriados…)</span>
            )}
            {errHol && <span className="ml-2 text-red-600">(sin feriados)</span>}
          </div>

          {/*  Icono calendario + >  */}
          <div className="flex items-center gap-2 shrink-0">            
            
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setMonth(m => addMonths(m, 1))}
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>


      <CardContent className="px-6 pb-6">
        <CalendarGrid
          days={days}
          month={month}
          holidaySet={holidaySet}
          birthdaySet={birthdaySet}
          onDayClick={(d) => {
            setSelected(d);
            setOpen(true);
          }}
        />

        <div className="flex items-center gap-4 mt-4 text-xs">
          <LegendDot className="bg-red-600" label="Feriado" />
          <LegendDot className="bg-green-600" label="Cumpleaños" />
        </div>
      </CardContent>

      {/* <DayDetailsDialog
        open={open}
        onOpenChange={setOpen}
        date={selected}
        holidays={selectedHolidays}
        birthdays={selectedBirthdaysBday}
      /> */}

      <DayDetailsSheet
        open={open}
        onOpenChange={setOpen}
        date={selected}
        holidays={selectedHolidays}
        birthdays={selectedBirthdaysBday}
      />
    </Card>
  );
}
