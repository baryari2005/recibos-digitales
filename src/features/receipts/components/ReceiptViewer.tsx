"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Receipt } from "../types/types";
import { useCan } from "@/hooks/useCan";
import { PayrollPdfViewerContent } from "./PayrollPdfViewerContent";

function getReceiptLabel(period: string) {
  const p = (period || "").toUpperCase();
  const parts = p.split("-");
  const suffix = parts.length > 2 ? parts[parts.length - 1] : "";

  const map: Record<string, string> = {
    VAC: "Vacaciones",
    SAC: "Aguinaldo",
    BON: "Bono",
  };

  return map[suffix] ?? "Recibo mensual";
}

export function ReceiptViewer({
  selected,
  onSign,
  signing,
}: {
  selected: Receipt | null;
  onSign: (disagree: boolean) => void;
  signing: boolean;
}) {
  const src = selected?.viewUrl ?? undefined;
  const canSign = useCan("recibos", "firmar");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-end gap-2 border-b bg-white p-3">
        {!selected?.signed && selected && canSign && (
          <>
            <Button
              size="sm"
              className="h-11 rounded bg-[#008C93] hover:bg-[#007381]"
              onClick={() => onSign(false)}
              disabled={signing}
            >
              {signing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Firmar Documento
            </Button>
            <Button
              size="sm"
              className="h-11 rounded bg-[#7F0000] hover:bg-[#630000]"
              onClick={() => onSign(true)}
              disabled={signing}
            >
              <AlertTriangle className="mr-1 h-4 w-4" />
              Firmar no conforme
            </Button>
          </>
        )}
      </div>

      <div className="min-h-0 flex-1">
        <PayrollPdfViewerContent
          title={
            selected
              ? `${getReceiptLabel(selected.period)} - ${selected.period}`
              : "No hay documentos seleccionados"
          }
          viewerUrl={src}
          emptyMessage={
            selected
              ? "No se pudo generar la URL de vista para este documento."
              : "Seleccioná un documento de la lista."
          }
        />
      </div>
    </div>
  );
}
