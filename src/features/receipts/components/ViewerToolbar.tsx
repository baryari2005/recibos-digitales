"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export function ViewerToolbar({
  viewerSrc, fitMode, scale,
  onResetFit, onZoomIn, onZoomOut, onEnterFs,
  onFirmar, onFirmarNoConforme, onConsultarRRHH
}: {
  viewerSrc: string | null;
  fitMode: "fitH" | "zoom";
  scale: number;
  onResetFit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onEnterFs: () => void;
  onFirmar: () => void;
  onFirmarNoConforme: () => void;
  onConsultarRRHH: () => void;
}) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onFirmarNoConforme}>Firmar no conforme</Button>
          <Button variant="secondary" size="sm" onClick={onConsultarRRHH}>Consultar a RRHH</Button>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onResetFit} disabled={!viewerSrc}>Ajustar</Button>
            </TooltipTrigger>
            <TooltipContent>Ajustar a alto (sin scroll)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-2 h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onZoomOut} disabled={!viewerSrc}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Alejar</TooltipContent>
          </Tooltip>

          <div className="mx-2 text-sm min-w-[64px] text-center">
            {fitMode === "fitH" ? "Ajustado" : `${(scale * 100).toFixed(0)}%`}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onZoomIn} disabled={!viewerSrc}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Acercar</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-2 h-6" />

          <Button variant="ghost" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm w-[56px] text-center">1 / 1</div>
          <Button variant="ghost" size="icon" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-2 h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onEnterFs} disabled={!viewerSrc}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pantalla completa</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-[#6b5bff] hover:bg-[#584ae6]" onClick={onFirmar} disabled={!viewerSrc}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Firmar Documento
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
