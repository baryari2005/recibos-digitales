"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import type { ApiResponse } from "../types/types";

type Props = {
  summary: ApiResponse["summary"];
};

export function ReceiptsSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="rounded border p-4">
        <div className="text-xs text-muted-foreground">Total documentos</div>
        <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
          <Users className="h-5 w-5" />
          {summary.totals}
        </div>
      </div>

      <div className="rounded border p-4">
        <div className="text-xs text-muted-foreground">Firmados</div>
        <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
          <CheckCircle2 className="h-5 w-5" />
          {summary.signed}
        </div>
      </div>

      <div className="rounded border p-4">
        <div className="text-xs text-muted-foreground">Disconformidad</div>
        <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
          <AlertTriangle className="h-5 w-5" />
          {summary.disagreement}
        </div>
      </div>

      <div className="rounded border p-4">
        <div className="text-xs text-muted-foreground">Cobertura</div>
        <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
          <Clock className="h-5 w-5" />
          {summary.coverage}%
        </div>
      </div>
    </div>
  );
}