"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PdfViewer({
  viewerSrc, fullscreen, onExitFullscreen
}: {
  viewerSrc: string | null;
  fullscreen: boolean;
  onExitFullscreen: () => void;
}) {
  const [sbw, setSbw] = useState(0);
  const TRIM = 8;

  useEffect(() => {
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.position = "absolute";
    outer.style.top = "-9999px";
    outer.style.width = "100px";
    outer.style.overflow = "scroll";
    document.body.appendChild(outer);

    const inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    const width = outer.offsetWidth - inner.offsetWidth;
    document.body.removeChild(outer);
    setSbw(width || 0);
  }, []);

  return (
    <Card className={fullscreen ? "fixed inset-4 z-50 shadow-2xl" : "h-[80vh]"}>
      <CardContent className="p-0 h-full">
        {viewerSrc ? (
          <div className="relative h-full w-full bg-white overflow-hidden">
            <iframe key={viewerSrc} src={viewerSrc} className="absolute inset-0 h-full w-full border-0 outline-none" />
            <div className="pointer-events-none absolute top-0 left-0 bg-white" style={{ height: TRIM, right: sbw }} />
            <div className="pointer-events-none absolute bottom-0 left-0 bg-white" style={{ height: TRIM, right: sbw }} />
            <div className="pointer-events-none absolute inset-y-0 left-0 bg-white" style={{ width: TRIM }} />
            <div className="pointer-events-none absolute top-0 bottom-0 bg-white" style={{ width: TRIM, right: sbw }} />
          </div>
        ) : (
          <div className="h-full grid place-items-center text-sm text-muted-foreground">
            No hay documento para mostrar
          </div>
        )}
      </CardContent>
      {fullscreen && (
        <div className="absolute top-2 right-2">
          <Button size="sm" variant="secondary" onClick={onExitFullscreen}>Salir de pantalla completa</Button>
        </div>
      )}
    </Card>
  );
}
