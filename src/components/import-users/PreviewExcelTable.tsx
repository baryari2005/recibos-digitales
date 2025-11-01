// src/components/import-users/PreviewExcelTable.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { ExcelRow } from "./types";

export default function PreviewExcelTable({
  rows,
  loading,
  onCreateAll,
}: {
  rows: ExcelRow[];
  loading: boolean;
  onCreateAll: () => void;
}) {
  if (!rows.length) return null;

  return (
    <>
      <div className="rounded border mb-8">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">UserId</th>
              <th className="p-2 text-left">CUIL</th>
              <th className="p-2 text-left">Apellido y nombre</th>
              <th className="p-2 text-left">Legajo</th>
              <th className="p-2 text-left">Fecha ingreso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{r.userId ?? "-"}</td>
                <td className="p-2">{r.cuil ?? "-"}</td>
                <td className="p-2">
                  {r.apellido ?? "-"} {r.nombre ?? "-"}
                </td>
                <td className="p-2">{r.legajo ?? "-"}</td>
                <td className="p-2">{r.fechaIngreso ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        onClick={onCreateAll}
        disabled={loading}
        className="w-full mb-8 rounded h-11 bg-[#008C93] hover:bg-[#007381]"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Procesando…
          </>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            Crear/Actualizar Usuarios
          </span>
        )}
      </Button>
    </>
  );
}
