"use client";

import { useState } from "react";

export function useAvatarStaging() {
  const [tmpPath, setTmpPath] = useState<string | null>(null);

  // Este lo debería usar tu <AvatarUploader /> para subir temporal
  async function uploadTemp(file: File) {
    const fd = new FormData();
    fd.append("file", file);

    // Endpoint de subida temporal (ajustá si ya tenés otro)
    const res = await fetch("/api/uploads/avatar/tmp", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error subiendo avatar temporal");
    setTmpPath(data.path); // ej: "avatars/tmp/abcd.png"
    return data;           // { path, url? }
  }

  // Mueve de tmp -> finalPrefix y borra la tmp. Devuelve publicUrl.
  async function commit(finalPrefix: string, oldPath?: string | null) {
    if (!tmpPath) throw new Error("No hay tmpPath para commitear.");

    const res = await fetch("/api/uploads/avatar/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmpPath, finalPrefix, oldPath: oldPath || null }),
    });

    // Log completo si falla
    if (!res.ok) {
      let body: any = null;
      try { body = await res.json(); } catch {}
      console.error("[avatar commit] failed", res.status, body);
      throw new Error(body?.error || `Commit failed (${res.status})`);
    }

    const data = await res.json(); // { publicUrl, path }
    setTmpPath(null);
    return data as { publicUrl: string; path: string };
  }

  return { tmpPath, setTmpPath, uploadTemp, commit };
}
