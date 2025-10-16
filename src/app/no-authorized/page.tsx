// src/app/no-authorized/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "No autorizado" };

type Message = { title: string; desc: string };

const messages = {
  role: {
    title: "Sin permisos",
    desc: "Tu rol no tiene acceso a esta sección. Si creés que es un error, contactá al administrador.",
  },
  auth: {
    title: "Sesión requerida",
    desc: "Necesitás iniciar sesión para acceder a esta página.",
  },
} satisfies Record<string, Message>;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NoAuthorizedPage({
  searchParams,
}: { searchParams?: SearchParams }) {
  const sp = (await searchParams) ?? {};
  const reasonRaw = sp.reason;
  // ✅ normalizamos: si viene array tomamos el primero, y puede quedar undefined
  const reason = Array.isArray(reasonRaw) ? reasonRaw[0] : reasonRaw;

  const defaultMsg: Message = {
    title: "Acceso denegado",
    desc: "No tenés permisos para ver esta página.",
  };

  // ✅ solo indexamos si 'reason' es string y clave válida
  const msg: Message =
    reason && reason in messages
      ? messages[reason as keyof typeof messages]
      : defaultMsg;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-8 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-destructive" />
          </div>

          <h1 className="text-xl font-semibold">{msg.title}</h1>
          <p className="text-sm text-muted-foreground">{msg.desc}</p>

          <div className="pt-2 flex items-center justify-center gap-2">
            <Link href="/"><Button variant="secondary">Ir al inicio</Button></Link>
            <Link href="/login"><Button className="bg-[#008C93] hover:bg-[#007381]">Iniciar sesión</Button></Link>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            Código: {reason ?? "unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}
