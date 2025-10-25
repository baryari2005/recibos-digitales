"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileDown, Timer, Users, FileSpreadsheet } from "lucide-react";

type Stats = {
  users: number;
  legajos: number;
  elapsedMs: number;
  filename?: string;
};

export default function ExportUsersPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  async function handleExportExcel() {
    setLoading(true);
    setStats(null);
    const t0 = performance.now();

    try {
      const res = await fetch("/api/users/export", { method: "GET" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Error ${res.status}`);
      }

      // Cabeceras con estadísticas
      const users = Number(res.headers.get("X-Users-Count") || "0");
      const legajos = Number(res.headers.get("X-Legajos-Count") || "0");
      const elapsedServer = Number(res.headers.get("X-Elapsed-Ms") || "0");

      // Obtener nombre de archivo desde Content-Disposition
      const cd = res.headers.get("Content-Disposition") || "";
      const m = cd.match(/filename="(.+?)"/i);
      const filename = m?.[1] || "export_usuarios_legajos.xlsx";

      // Descargar archivo
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const elapsedClient = Math.round(performance.now() - t0);

      setStats({
        users,
        legajos,
        elapsedMs: elapsedServer || elapsedClient,
        filename,
      });

      toast.success(`Export listo (${users} usuarios, ${legajos} legajos)`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "No se pudo exportar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6" />
            Exportar usuarios
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Genera un Excel con dos solapas: <b>Usuarios</b> y <b>Legajos</b>.
          </p>

          <Button
            onClick={handleExportExcel}
            disabled={loading}
            className="w-full h-11 rounded bg-[#008C93] hover:bg-[#007381]"
          >
            {loading ? (
              <>
                <FileDown className="h-5 w-5 mr-2 animate-bounce" />
                Exportando…
              </>
            ) : (
              <>
                <FileDown className="h-5 w-5 mr-2" />
                Exportar a Excel (Usuarios + Legajos)
              </>
            )}
          </Button>

          <Separator />

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded border p-4">
                <div className="text-sm text-muted-foreground">Usuarios exportados</div>
                <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                  <Users className="h-6 w-6" /> {stats.users}
                </div>
              </div>

              <div className="rounded border p-4">
                <div className="text-sm text-muted-foreground">Legajos exportados</div>
                <div className="mt-1 text-2xl font-semibold">{stats.legajos}</div>
              </div>

              <div className="rounded border p-4">
                <div className="text-sm text-muted-foreground">Tiempo</div>
                <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                  <Timer className="h-6 w-6" />
                  {(stats.elapsedMs / 1000).toFixed(2)}s
                </div>
              </div>

              {stats.filename && (
                <div className="md:col-span-3 text-sm text-muted-foreground">
                  Archivo: <b>{stats.filename}</b>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
