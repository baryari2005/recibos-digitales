"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeaveTypes } from "../../hooks/useLeaveTypes";

type Props = {
  value?: string;
  onChange: (v: string) => void;
  excludeTypes?: string[];
};

export function LeaveTypeStep({ value, onChange, excludeTypes = [], }: Props) {
  const { types } = useLeaveTypes();

  return (
    <div className="pt-14">
      <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-xs mx-auto">
        Seleccioná el tipo de vacaciones o licencias que desea solicitar
      </p>

      {/* Separación real */}
      <div className="mt-12">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full px-4 py-3 rounded">
            <SelectValue placeholder="Tipo de licencia" />
          </SelectTrigger>

          <SelectContent>
            {types
            .filter((t) => !excludeTypes.includes(t.code))
            .map((t) => (
              <SelectItem key={t.code} value={t.code}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
