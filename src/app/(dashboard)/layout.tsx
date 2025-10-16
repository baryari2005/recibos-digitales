// src/app/(dashboard)/layout.tsx
"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import type { CurrentUser } from "@/features/auth/types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  // Si Topbar/Sidebar necesitan el user, lo resolvés acá una sola vez
  const { user } = useCurrentUser();

  return (
    <RequireAuth>
      <div
        className="
          min-h-screen grid
          grid-cols-[var(--sidebar-w)_1fr]
          grid-rows-[var(--topbar-h)_1fr]
          bg-muted/30
        "
        style={
          {
            ["--sidebar-w" as any]: "90px",
            ["--topbar-h" as any]: "84px",
            ["--content-pad" as any]: "20px",
          } as React.CSSProperties
        }
      >
        {/* Columna 1: Sidebar, ocupa ambas filas */}
        <aside className="row-[1/3] col-[1/2]">
          <Sidebar user={user as CurrentUser | null} />
        </aside>

        {/* Fila 1, Col 2: Topbar */}
        <header className="col-[2/3] row-[1/2] sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Topbar />
        </header>

        {/* Fila 2, Col 2: Contenido */}
        <main className="col-[2/3] row-[2/3] min-w-0">
          <div className="p-[var(--content-pad)]">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
