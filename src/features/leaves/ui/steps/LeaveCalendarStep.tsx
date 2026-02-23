"use client";

import { DateRange } from "react-day-picker";
import { LeaveDateRangePicker } from "../LeaveDateRangePicker";
import { calcLeaveDays } from "../../domain/calcLeaveDays";

type Props = {
  value?: DateRange;
  onChange: (v?: DateRange) => void;
};

export function LeaveCalendarStep({ value, onChange }: Props) {
  const days =
    value?.from && value?.to
      ? calcLeaveDays(value.from, value.to)
      : 0;

  return (
    <div className="space-y-3 pt-8">
      <p className="text-sm text-center leading-relaxed max-w-xs mx-auto text-[#008C93]">
        Seleccioná el rango de fechas
      </p>
      <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-xs mx-auto">
        Desde el día que inicia tu licencia hasta el día que regresas a la oficina
        <br />
        <span className="text-xs">(El día de regreso no se contabiliza)</span>
      </p>

      <LeaveDateRangePicker value={value} onChange={onChange} />

    </div>
  );
}
