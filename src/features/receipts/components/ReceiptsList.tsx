"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Check, Loader2 } from "lucide-react";
import type { Receipt } from "../../receipts/types";

export function ReceiptsList({
  list,
  loading,
  selectedId,
  onSelect,
}: {
  list: Receipt[];
  loading: boolean;
  selectedId?: string | null;
  onSelect: (r: Receipt) => void;
}) {
  return (
    <>
      <Separator />
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground flex">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cargando documentos…
          </div>
        ) : list.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No hay documentos.</div>
        ) : (
          <ul className="p-2 space-y-2">
            {list.map((r) => (
              <li key={`${r.id}-${new Date(r.updatedAt).getTime()}`}>
                <button
                  onClick={() => onSelect(r)}
                  className={`w-full text-left rounded border px-3 py-2 hover:bg-muted/50 transition ${
                    selectedId === r.id ? "ring-2 ring-[#008C93] bg-muted/60" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    <div className="flex-1">
                      <div className="text-sm-plus font-medium">Recibo mensual</div>
                      <div className="text-xs text-muted-foreground">{r.period}</div>
                    </div>
                    {r.signed ? (
                      <Badge className="bg-green-600 hover:bg-green-600">
                        <Check className="w-3 h-3 mr-1" /> Firmado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[#008C93] border-[#008C93]">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </>
  );
}
