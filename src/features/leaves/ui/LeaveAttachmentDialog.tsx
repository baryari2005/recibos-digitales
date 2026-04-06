"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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

export function LeaveAttachmentDialog({
    open,
    onOpenChange,
    fileUrl,
    fileName,
    mimeType,
}: LeaveAttachmentDialogProps) {
    const fileType = resolveFileType(fileUrl, mimeType);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[98vw] !max-w-6xl h-[95vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle className="truncate">
                        {fileName || "Adjunto de licencia"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 min-h-0 overflow-hidden p-6">
                    {!fileUrl ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No hay archivo para mostrar.
                        </div>
                    ) : fileType === "image" ? (

                        <div className="flex h-full w-full items-center justify-center overflow-auto rounded-md border bg-white p-4">
                            <img
                                src={fileUrl}
                                alt={fileName || "Adjunto"}
                                className="max-h-[70vh] max-w-full object-contain"
                            />
                        </div>

                    ) : fileType === "pdf" ? (
                        <iframe
                            src={fileUrl}
                            title={fileName || "Adjunto PDF"}
                            className="h-full w-full rounded-md border"
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                            <span>No se puede previsualizar este tipo de archivo.</span>
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-primary"
                            >
                                Abrir en otra pestaña
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}