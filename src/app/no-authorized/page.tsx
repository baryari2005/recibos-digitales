// src/app/no-autorizado/page.tsx
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "No autorizado",
};

type Props = {
  searchParams?: { reason?: string };
};

const messages: Record<
  string,
  { title: string; desc: string }
> = {
  role: {
    title: "Sin permisos",
    desc: "Tu rol no tiene acceso a esta sección. Si creés que es un error, contactá al administrador.",
  },
  auth: {
    title: "Sesión requerida",
    desc: "Necesitás iniciar sesión para acceder a esta página.",
  },
};

export default function NoAuthorizedPage({ searchParams }: Props) {
  const reason = searchParams?.reason ?? "";
  const msg =
    messages[reason] ??
    ({
      title: "Acceso denegado",
      desc: "No tenés permisos para ver esta página.",
    } as const);

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
            <Link href="/">
              <Button variant="secondary">Ir al inicio</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-[#008C93] hover:bg-[#007381]">
                Iniciar sesión
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            Código: {reason || "unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}
