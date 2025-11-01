// src/components/import-users/CredentialsTable.tsx
"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Cred } from "./types";

export default function CredentialsTable({
  creds,
  onDownload,
}: {
  creds: Cred[];
  onDownload: () => void;
}) {
  if (!creds.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Credenciales temporales (mostrar solo ahora)
        </h3>
        <Button
          onClick={onDownload}
          className="mb-8 rounded h-11 bg-[#008C93] hover:bg-[#007381] text-white"
        >
          <FileDown className="w-6 h-6" />
          Descargar CSV
        </Button>
      </div>

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Usuario</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Contraseña temporal</th>
              <th className="p-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {creds.map((c, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{c.userId}</td>
                <td className="p-2">{c.email}</td>
                <td className="p-2 font-mono">{c.tempPassword}</td>
                <td className="p-2">
                  {c.status === "created" ? "Creado" : "Actualizado"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Por seguridad, estas contraseñas solo se muestran en esta pantalla. Al
        iniciar sesión, se requerirá cambiarlas.
      </p>
    </div>
  );
}
