// src/components/CenteredSpinner.tsx
"use client";
import { Loader2 } from "lucide-react";

export function CenteredSpinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
