"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  ExternalLink,
  Eye,
  FileImage,
  FileText,
  Paperclip,
} from "lucide-react";

type LeaveAttachmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
};

function resolveFileType(
  fileUrl?: string | null,
  mimeType?: string | null
): "image" | "pdf" | "unknown" {
  if (mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType === "application/pdf") return "pdf";
  }

  if (!fileUrl) return "unknown";

  const cleanUrl = fileUrl.split("?")[0].toLowerCase();

  if (
    cleanUrl.endsWith(".jpg") ||
    cleanUrl.endsWith(".jpeg") ||
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".webp") ||
    cleanUrl.endsWith(".gif")
  ) {
    return "image";
  }

  if (cleanUrl.endsWith(".pdf")) {
    return "pdf";
  }

  return "unknown";
}

function getFileTypeLabel(fileType: "image" | "pdf" | "unknown") {
  if (fileType === "image") return "Imagen";
  if (fileType === "pdf") return "PDF";
  return "Archivo";
}

export function LeaveAttachmentDialog({
  open,
  onOpenChange,
  fileUrl,
  fileName,
  mimeType,
}: LeaveAttachmentDialogProps) {
  const fileType = resolveFileType(fileUrl, mimeType);
  const title = fileName || "Adjunto de licencia";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] !w-[96vw] !max-w-6xl flex-col overflow-hidden border-0 bg-slate-50 p-0">
        <DialogHeader className="shrink-0 border-b bg-white px-6 py-4 pr-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                {fileType === "image" ? (
                  <FileImage className="h-3.5 w-3.5" />
                ) : fileType === "pdf" ? (
                  <FileText className="h-3.5 w-3.5" />
                ) : (
                  <Paperclip className="h-3.5 w-3.5" />
                )}
                {getFileTypeLabel(fileType)}
              </div>

              <DialogTitle className="truncate text-left text-lg font-semibold">
                {title}
              </DialogTitle>

              {mimeType ? (
                <p className="mt-1 text-sm text-muted-foreground">{mimeType}</p>
              ) : null}
            </div>

            {fileUrl ? (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <Button asChild variant="outline" className="h-10 rounded">
                  <a href={fileUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir
                  </a>
                </Button>

                <Button
                  asChild
                  className="h-10 rounded bg-[#008C93] hover:bg-[#007381]"
                >
                  <a href={fileUrl} target="_blank" rel="noreferrer" download>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </a>
                </Button>
              </div>
            ) : null}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden p-5">
          {!fileUrl ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-white text-sm text-muted-foreground">
              <Paperclip className="h-8 w-8 text-[#008C93]" />
              <span>No hay archivo para mostrar.</span>
            </div>
          ) : fileType === "image" ? (
            <div className="flex h-full w-full items-center justify-center overflow-auto rounded-2xl border bg-white p-4 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl}
                alt={title}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            </div>
          ) : fileType === "pdf" ? (
            <div className="h-full overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                Vista previa del PDF
              </div>

              <iframe
                src={fileUrl}
                title={title}
                className="h-[calc(100%-49px)] w-full"
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">
              <Paperclip className="h-8 w-8 text-[#008C93]" />

              <div>
                <p className="font-medium text-foreground">
                  No se puede previsualizar este archivo
                </p>
                <p className="mt-1">
                  Podés abrirlo o descargarlo para verlo fuera del sistema.
                </p>
              </div>

              <Button asChild variant="outline" className="h-10 rounded">
                <a href={fileUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir en otra pestaña
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
