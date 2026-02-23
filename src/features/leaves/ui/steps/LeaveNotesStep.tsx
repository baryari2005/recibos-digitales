// steps/LeaveNotesStep.tsx
"use client";

import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function LeaveNotesStep({ value, onChange }: Props) {
  return (
    <div className="space-y-3 pt-6">
      <h3 className="text-sm font-medium text-center text-[#008C93]">
        Observaciones
      </h3>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Podés agregar un comentario (opcional)"
        maxLength={1500}
        className="min-h-[140px]"
      />

      <p className="text-xs text-muted-foreground text-right">
        {value.length} / 1500
      </p>
    </div>
  );
}
