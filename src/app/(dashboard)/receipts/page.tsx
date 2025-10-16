"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { usePdfViewer } from "@/components/receipts/hooks/usePdfViewer";
import { ReceiptsSidebar } from "@/components/receipts/ReceiptsSidebar";
import { ViewerToolbar } from "@/components/receipts/ViewerToolbar";
import { PdfViewer } from "@/components/receipts/PdfViewer";
import { DocItem } from "@/components/receipts/types";
import { axiosInstance } from "@/lib/axios";



export default function MisRecibos() {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [tab, setTab] = useState<"pendientes" | "firmados">("pendientes");
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { scale, fitMode, fullscreen, zoomIn, zoomOut, resetFit, enterFs, exitFs } = usePdfViewer();

  const selected = useMemo(() => docs.find(d => d.id === selectedId) || null, [docs, selectedId]);

  const viewerSrc = useMemo(() => {
    if (!selected?.url) return null;
    const params = new URLSearchParams({ toolbar: "0", navpanes: "0", statusbar: "0" });
    const base = selected.url;
    const hash = fitMode === "fitH" ? `view=FitH&${params.toString()}` : `zoom=${Math.round(scale * 100)}&${params.toString()}`;
    return `${base}#${hash}`;
  }, [selected?.url, fitMode, scale]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/payroll/my-doc", { params: { period } });
      // si llegó aquí, el status es 2xx; validamos que venga la URL
      if (!data?.url) {
        throw new Error(data?.error || "No se encontró el recibo para tu CUIL.");
      }

      const item: DocItem = {
        id: `recibo-${period}`,
        title: "RECIBOS-MENSUAL",
        period,
        status: "PENDIENTE",
        url: data.url,
      };

      setDocs([item]);
      setSelectedId(item.id);
      resetFit();
    } catch (err: any) {
      // Axios trae info útil en err.response
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo obtener el documento.";

      // Podés loguear paths probados si vienen:
      if (err?.response?.data?.tried) {
        console.debug("[my-doc tried paths]", err.response.data.tried);
      }

      setDocs([]);
      setSelectedId(null);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* al montar */ }, []); // eslint-disable-line
  const onBuscar = () => { resetFit(); load(); };

  const onFirmarNoConforme = () => toast.info("Se registró tu firma no conforme (demo).");
  const onConsultarRRHH = () => toast.message("RR.HH. recibirá tu consulta (demo).");
  const onFirmar = () => toast.success("Documento firmado (demo).");

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      <ReceiptsSidebar
        period={period} setPeriod={setPeriod}
        tab={tab} setTab={setTab}
        loading={loading}
        docs={docs}
        selectedId={selectedId}
        onBuscar={onBuscar}
        onSelect={setSelectedId}
      />

      <div className="col-span-9">
        <Card className="mb-3">
          <CardContent className="p-3">
            <ViewerToolbar
              viewerSrc={viewerSrc}
              fitMode={fitMode}
              scale={scale}
              onResetFit={resetFit}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onEnterFs={enterFs}
              onFirmar={onFirmar}
              onFirmarNoConforme={onFirmarNoConforme}
              onConsultarRRHH={onConsultarRRHH}
            />
          </CardContent>
        </Card>

        <PdfViewer viewerSrc={viewerSrc} fullscreen={fullscreen} onExitFullscreen={exitFs} />

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <HelpCircle className="h-3.5 w-3.5" />
          Si el visor no carga,{" "}
          <a className="underline" href={selected?.url || "#"} target="_blank" rel="noreferrer">
            abre el PDF en una pestaña nueva
          </a>.
        </div>
      </div>
    </div>
  );
}
