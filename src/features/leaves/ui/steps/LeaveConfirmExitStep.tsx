// steps/LeaveConfirmExitStep.tsx
"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export function LeaveConfirmExitStep({ onConfirm, onCancel }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-6">
      <div className="h-16 w-16 rounded-full bg-[#008C93] flex items-center justify-center">
        <AlertTriangle className="h-10 w-10 mb-1 text-white" />
      </div>

       <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-xs mx-auto mt-8 mb-8">
        ¿Estás seguro que deseas cancelar esta solicitud?
      </p>

      <div className="flex gap-4">
        <Button  onClick={onConfirm} className="w-28 h-11 rounded bg-[#008C93] hover:bg-[#007381]">
          Sí
        </Button>
        <Button  className="w-28 h-11 rounded bg-[#008C93] hover:bg-[#007381]" onClick={onCancel}>
          No
        </Button>
      </div>
    </div>
  );
}
