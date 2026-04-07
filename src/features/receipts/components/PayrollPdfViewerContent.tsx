"use client";

import { Button } from "@/components/ui/button";
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  SearchX,
} from "lucide-react";

type Props = {
  title: string;
  viewerUrl?: string | null;
  loading?: boolean;
  emptyMessage?: string;
  openLabel?: string;
};

export function PayrollPdfViewerContent({
  title,
  viewerUrl,
  loading = false,
  emptyMessage = "No hay documento para mostrar.",
  openLabel = "Abrir en pestaña",
}: Props) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50">
      <div className="flex items-center justify-between gap-3 border-b bg-white px-4 py-3 pr-14">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            PDF
          </div>
          <div className="truncate text-sm font-semibold">{title}</div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Button
            asChild
            variant="outline"
            className="h-10 rounded"
            disabled={!viewerUrl || loading}
          >
            <a href={viewerUrl ?? "#"} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {openLabel}
            </a>
          </Button>

          <Button
            asChild
            className="h-10 rounded bg-[#008C93] hover:bg-[#007381]"
            disabled={!viewerUrl || loading}
          >
            <a href={viewerUrl ?? "#"} target="_blank" rel="noreferrer" download>
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </a>
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center rounded-2xl border bg-white text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando visor...
          </div>
        ) : viewerUrl ? (
          <div className="h-full overflow-hidden rounded-2xl border bg-white shadow-sm">
            <iframe
              key={viewerUrl}
              src={viewerUrl}
              className="h-full w-full border-0"
              title={title}
              allow="fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-white text-sm text-muted-foreground">
            <SearchX className="h-8 w-8 text-[#008C93]" />
            <span>{emptyMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
