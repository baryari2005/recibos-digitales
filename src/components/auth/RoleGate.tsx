// src/components/auth/RoleGate.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Loader2 } from "lucide-react";

type Mode = "render" | "redirect";

export function RoleGate({
  allow = ["admin"],
  mode = "render",
  // 👇 fallback por defecto: spinner centrado
  fallback = <CenteredSpinner label="Verificando permisos…" />,
  children,
}: {
  allow?: string[];
  mode?: Mode;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  const allowed = useMemo(() => {
    const role = user?.rol?.nombre?.toLowerCase();
    return role ? allow.map((a) => a.toLowerCase()).includes(role) : false;
  }, [user, allow]);

  useEffect(() => {
    if (mode === "redirect" && !loading && !allowed) {
      router.replace("/no-authorized?reason=role");
    }
  }, [mode, loading, allowed, router]);

  if (loading) return fallback;

  if (!allowed) {
    if (mode === "redirect") return null;
    return <NoAccessInLayout />;
  }

  return <>{children}</>;
}

/** Spinner centrado reutilizable */
function CenteredSpinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

function NoAccessInLayout() {
  return (
    <div className="grid gap-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive font-bold">!</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Sin acceso</h2>
            <p className="text-sm text-muted-foreground">
              No tenés permisos para ver esta sección. Si creés que es un error, contactá al administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
