"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import type { Receipt } from "../../receipts/types";

export function ReceiptViewer({
  selected,
  onSign,
  signing,
}: {
  selected: Receipt | null;
  onSign: (disagree: boolean) => void;
  signing: boolean;
}) {
  const key = selected ? `${selected.id}:${selected.viewVersion ?? new Date(selected.updatedAt).getTime()}` : "none";
  const src = selected?.viewUrl ?? undefined;

  return (
    <div className="p-0 h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <div>
          <div className="text-sm-plus font-semibold">
            {selected ? `Recibo mensual — ${selected.period}` : "Sin selección"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selected?.viewUrl && (
            <Button
              size="sm"
              variant="outline"
              className="h-11 rounded"
              onClick={() => window.open(selected.viewUrl!, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-1" /> Abrir en pestaña
            </Button>
          )}

          {!selected?.signed && selected && (
            <>
              <Button
                size="sm"
                className="bg-[#008C93] hover:bg-[#007381] h-11 rounded"
                onClick={() => onSign(false)}
                disabled={signing}
              >
                {signing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Firmar Documento
              </Button>
              <Button
                size="sm"
                className="h-11 rounded bg-[#7F0000] hover:bg-[#630000]"
                onClick={() => onSign(true)}
                disabled={signing}
              >
                <AlertTriangle className="w-4 h-4 mr-1" /> Firmar no conforme
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-muted/20">
        {src ? (
          <iframe
            key={key}
            src={src}
            className="w-full h-full"
            allow="fullscreen"
            allowFullScreen
          />
        ) : selected ? (
          <div className="h-full grid place-items-center text-sm text-muted-foreground p-6">
            No se pudo generar la URL de vista para este documento.
          </div>
        ) : (
          <div className="h-full grid place-items-center text-sm text-muted-foreground p-6">
            Seleccioná un documento de la lista.
          </div>
        )}
      </div>
    </div>
  );
}
