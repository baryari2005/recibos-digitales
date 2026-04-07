"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { axiosInstance } from "@/lib/axios";
import { PayrollPdfViewerContent } from "./PayrollPdfViewerContent";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  filePath?: string | null;
  viewerUrl?: string | null;
};

type SignedUrlResponse = {
  signedUrl?: string;
};

export function PayrollPdfViewerDialog({
  open,
  onOpenChange,
  title,
  filePath,
  viewerUrl,
}: Props) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(viewerUrl ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (viewerUrl) {
      setResolvedUrl(viewerUrl);
      return;
    }

    if (!filePath) {
      setResolvedUrl(null);
      return;
    }

    const fetchSignedUrl = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get<SignedUrlResponse>(
          "/admin/storage/sign",
          {
            params: { path: filePath },
          }
        );

        setResolvedUrl(data.signedUrl ?? null);
      } catch (error) {
        console.error("No se pudo obtener la URL firmada del PDF:", error);
        setResolvedUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [filePath, open, viewerUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[92vh] !w-[96vw] !max-w-7xl overflow-hidden border-0 p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <PayrollPdfViewerContent
          title={title}
          viewerUrl={resolvedUrl}
          loading={loading}
          emptyMessage="No se pudo preparar el PDF para visualizar."
          openLabel="Abrir PDF"
        />
      </DialogContent>
    </Dialog>
  );
}
