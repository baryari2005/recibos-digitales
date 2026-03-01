"use client";

import { DateRange } from "react-day-picker";
import { LeaveDateRangePicker } from "../LeaveDateRangePicker";

type Props = {
  value?: DateRange;
  onChange: (v?: DateRange) => void;

  // ✅ NUEVO
  type?: string;
  onDaysChange?: (days: number) => void;
};

export function LeaveCalendarStep({ value, onChange, type, onDaysChange }: Props) {
  return (
    <div className="space-y-3 pt-8">
      <p className="text-sm text-center leading-relaxed max-w-xs mx-auto text-[#008C93]">
        Seleccioná el rango de fechas
      </p>
      <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-xs mx-auto">
        Desde el día que inicia tu licencia hasta el día que regresas a la oficina
        <br />
        <span className="text-xs">(No se contabilizan feriados, domingos ni el día de regreso.)</span>
      </p>

      <LeaveDateRangePicker
        value={value}
        onChange={onChange}
        type={type}
        onDaysChange={onDaysChange}
      />
    </div>
  );
}