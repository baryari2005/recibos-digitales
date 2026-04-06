"use client";

import { Badge } from "@/components/ui/badge";
import type { ReceiptStatus } from "../types/types";

type Props = {
  status: ReceiptStatus;
};

export function ReceiptStatusBadge({ status }: Props) {
  if (status === "FIRMADO") {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-600">
        Firmado
      </Badge>
    );
  }

  if (status === "DISCONFORMIDAD") {
    return (
      <Badge className="bg-amber-600 hover:bg-amber-600">
        Disconformidad
      </Badge>
    );
  }

  return (
    <Badge className="bg-slate-500 hover:bg-slate-500">
      Pendiente
    </Badge>
  );
}