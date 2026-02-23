"use client";

import { Clock } from "lucide-react";

type Props = {
  pendingLabel: string; // ej: "(2026-04-15 → 2026-04-17)"
  onViewRequests: () => void;
};

export function PendingVacationBlock({ pendingLabel, onViewRequests }: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="h-16 w-16 rounded-full bg-[#008C93] flex items-center justify-center">
          <Clock className="h-10 w-10 mb-1 text-white" />
        </div>

        <h3 className="mt-4 text-base font-semibold">
          Tenés una solicitud pendiente
        </h3>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Tenés una solicitud de vacaciones pendiente de aprobación{" "}
          <span className="font-medium text-foreground">{pendingLabel}</span>.
          <br />
          No podés cargar una nueva solicitud hasta que sea aprobada o rechazada.
        </p>
      </div>
    </div>
  );
}