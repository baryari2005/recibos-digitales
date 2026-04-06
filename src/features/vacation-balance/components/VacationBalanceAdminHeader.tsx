"use client";

import { CalendarDays, Save, SaveAll } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  year: number;
  onOpenBulk: () => void;
  onOpenCreate: () => void;
};

export function VacationBalanceAdminHeader({
  year,
  onOpenBulk,
  onOpenCreate,
}: Props) {
  return (
    <CardHeader className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2 text-xl">
        <CalendarDays className="w-5 h-5" />
        Saldo de Vacaciones
      </CardTitle>

      <div className="flex gap-2">
        <Button
          size="lg"
          className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
          onClick={onOpenBulk}
        >
          <SaveAll className="w-4 h-4" />
          Asignar saldo {year}
        </Button>

        <Button
          size="lg"
          className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
          onClick={onOpenCreate}
        >
          <Save className="w-4 h-4" />
          Asignar saldo por Usuario
        </Button>
      </div>
    </CardHeader>
  );
}