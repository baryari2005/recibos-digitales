// src/components/Settings/AvatarUploader.tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

type Props = {
  currentUrl?: string | null;
  onTempUploaded: (p: { tmpPath: string; publicUrl: string }) => void;
  maxKB?: number;   // 200
  minSize?: number; // 128
  maxSide?: number; // 512
  disabled?: boolean;
};

type CompressOpts = {
  maxSide: number;
  maxBytes: number;
  minQuality?: number;
  step?: number;
};

const toDataURL = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function compressToJpeg(
  img: HTMLImageElement,
  { maxSide, maxBytes, minQuality = 0.6, step = 0.05 }: CompressOpts
): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);

  let q = 0.9;
  let blob: Blob | null = null;
  while (q >= (minQuality ?? 0.6)) {
    blob = await new Promise<Blob | null>((ok) =>
      canvas.toBlob((b) => ok(b), "image/jpeg", q)
    );
    if (blob && blob.size <= maxBytes) break;
    q -= step ?? 0.05;
  }
  if (!blob) {
    blob = await new Promise<Blob | null>((ok) =>
      canvas.toBlob((b) => ok(b), "image/jpeg", minQuality ?? 0.6)
    );
  }
  return blob!;
}

export function AvatarUploader({
  currentUrl,
  onTempUploaded,
  maxKB = 200,
  minSize = 128,
  maxSide = 512,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | undefined>(currentUrl ?? undefined);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Solo JPG o PNG");
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await toDataURL(file);
      const img = await loadImage(dataUrl);
      if (img.width < minSize || img.height < minSize) {
        toast.error(`Mínimo ${minSize}×${minSize}px`);
        return;
      }

      const blob = await compressToJpeg(img, { maxSide, maxBytes: maxKB * 1024 });
      const uploadFile = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      const fd = new FormData();
      fd.append("file", uploadFile);

      const resp = await fetch("/api/media/avatars/upload", { method: "POST", body: fd });
      const json = await resp.json();

      if (!resp.ok) throw new Error(json.error || "Error al subir");
      setPreview(json.publicUrl);
      onTempUploaded({ tmpPath: json.tmpPath, publicUrl: json.publicUrl });
      toast.success("Imagen subida");
    } catch (e: any) {
      toast.error(e?.message ?? "Error al subir");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={preview} />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>

      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Cambiar avatar</div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button type="button" variant="secondary" className="h-11 rounded" onClick={pick} disabled={uploading}>
            {uploading ? "Subiendo…" : "Seleccionar imagen"}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">JPG/PNG • máx. {maxKB}KB • mín. {minSize}×{minSize}px</div>
      </div>
    </div>
  );
}
