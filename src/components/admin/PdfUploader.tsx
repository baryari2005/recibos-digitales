// components/admin/PdfUploader.tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/stores/auth";
import { Loader2, FileText, Upload } from "lucide-react";

type SplitStats = {
  bucket: string;
  period: string;
  sourcePath: string;
  prefixPath: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;

  totalPages: number;
  detectedPagesWithCuil: number;
  uniqueCuils: number;
  uploaded: number;
  duplicates: { count: number; cuils: string[] };
  unmatched: { count: number; pages: number[] };
  sampleCuils: string[];
};

export default function PdfUploader({
  onUploaded,
}: {
  onUploaded?: (f: { url: string; path: string; name: string; size: number }) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [stats, setStats] = useState<SplitStats | null>(null);
  const { token } = useAuth();

  const pick = () => inputRef.current?.click();

  const upload = async () => {
    if (!file) return;
    if (!token) return toast.error("No tienes sesión iniciada.");
    if (file.size > 16 * 1024 * 1024) return toast.error("Máximo 16MB");

    setUploading(true);
    setStats(null);
    try {
      // 1) Subir a Supabase via API
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/upload-pdf", {
        method: "POST",
        body: fd,
        headers: { Authorization: `Bearer ${token}` },
      });
      const uploadTxt = await res.text();
      const uploadData = uploadTxt ? JSON.parse(uploadTxt) : {};
      if (!res.ok) throw new Error(uploadData?.error || "Error subiendo PDF");

      toast.success("PDF subido correctamente");
      onUploaded?.(uploadData); // uploadData.path es clave

      // 2) Hacer el split por CUIL
      const splitMsg = toast.loading(`Procesando período ${period}...`);
      const splitRes = await fetch("/api/admin/payroll/split", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ path: uploadData.path, period }),
      });
      const splitTxt = await splitRes.text();
      const splitData: SplitStats = splitTxt ? JSON.parse(splitTxt) : ({} as any);
      if (!splitRes.ok) throw new Error((splitData as any)?.error || "Error procesando PDF");

      setStats(splitData);
      toast.success(
        `OK: CUIL detectados ${splitData.uniqueCuils}, subidos ${splitData.uploaded} (en ${Math.round(splitData.durationMs)} ms).`,
        { id: splitMsg }
      );
      setFile(null);
    } catch (e: any) {
      toast.error(e.message || "Error en la carga/procesamiento");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center">
            <FileText className="mr-2" />Subir PDF de recibos
          </CardTitle>          
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Período */}
          <div className="space-y-2">
            <Label>Período<p className="text-xs text-muted-foreground">Formato YYYY-MM.</p></Label>
            <div className="flex gap-2">
              <Input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="YYYY-MM"
                className="h-11 rounded border pr-3"
              />
            </div>
          </div>

          {/* Archivo */}
          <div className="space-y-2">
            <Label>Archivo PDF<p className="text-xs text-muted-foreground">Formato PDF, máx. 16MB</p></Label>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex items-center gap-2">
              <Button type="button" className="h-11 rounded bg-[#008C93] hover:bg-[#007381]" onClick={pick}>
                <Upload className="w-4 h-4"/> Elegir archivo
              </Button>
              <span className="text-xs text-muted-foreground">
                {file ? file.name : "Ningún archivo seleccionado"}
              </span>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button
              onClick={upload}
              disabled={!file || uploading || !/^\d{4}-\d{2}$/.test(period)}
              className="w-full h-11 rounded bg-[#008C93] hover:bg-[#007381]"
            >
              {uploading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Subiendo y procesando...
                </span>
              ) : (
                "Subir y procesar"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de estadísticas */}
      {stats && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="text-sm font-medium">Resumen del procesamiento</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <Stat label="Período" value={stats.period} />
              <Stat label="Páginas totales" value={stats.totalPages} />
              <Stat label="Páginas con CUIL" value={stats.detectedPagesWithCuil} />
              <Stat label="CUIL únicos" value={stats.uniqueCuils} />
              <Stat label="Archivos subidos" value={stats.uploaded} />
              <Stat label="Duplicados (CUIL)" value={stats.duplicates.count} />
              <Stat label="Páginas sin CUIL" value={stats.unmatched.count} />
              <Stat label="Tiempo" value={`${Math.round(stats.durationMs)} ms`} />
            </div>

            {/* Extras */}
            {stats.duplicates.count > 0 && (
              <div className="text-xs text-muted-foreground">
                Duplicados (muestra): {stats.duplicates.cuils.join(", ")}
              </div>
            )}
            {stats.sampleCuils?.length > 0 && (
              <div className="text-xs text-muted-foreground">
                CUIL detectados (muestra): {stats.sampleCuils.slice(0, 10).join(", ")}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Carpeta destino: <span className="font-mono">{stats.prefixPath}</span> (bucket: <span className="font-mono">{stats.bucket}</span>)
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}
