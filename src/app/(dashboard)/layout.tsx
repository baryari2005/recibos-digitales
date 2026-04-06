"use client";

import { useState, useEffect } from "react";
import type { ReactNode, CSSProperties } from "react";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { MustChangePasswordGate } from "@/features/auth/components/MustChangePasswordGate";
import { useIdleLogout } from "@/features/auth/hooks/useIdleLogout";
import { IdleLogoutModal } from "@/features/auth/components/IdleLogoutModal";
import { Sidebar } from "@/components/layout/dashboard-sidebar/Sidebar";
import { Menu } from "lucide-react";
import { Topbar } from "@/components/layout/dashboard-topbar/Topbar";

type Props = {
  children: ReactNode;
};

type DashboardLayoutStyle = CSSProperties & {
  "--sidebar-w": string;
  "--topbar-h": string;
  "--content-pad": string;
};

export default function DashboardRootLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const idle = useIdleLogout(logout);

  const layoutStyle: DashboardLayoutStyle = {
    "--sidebar-w": collapsed ? "72px" : "240px",
    "--topbar-h": "84px",
    "--content-pad": "20px",
    gridTemplateColumns: "var(--sidebar-w) 1fr",
    gridTemplateRows: "var(--topbar-h) 1fr",
  };

  return (
    <RequireAuth>
      <MustChangePasswordGate>
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setCollapsed(false)}
            className="bg-[#008C93] text-white p-3 rounded-full shadow-lg"
          >
            <Menu />
          </button>
        </div>

        <div
          className="min-h-screen grid bg-muted/30 transition-all duration-300"
          style={layoutStyle}
        >
          <aside className="row-[1/3] col-[1/2] lg:relative fixed z-40">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          </aside>

          <header className="col-[2/3] row-[1/2] sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Topbar />
          </header>

          <main className="col-[2/3] row-[2/3] min-w-0 transition-all duration-300">
            <div className="p-[var(--content-pad)]">{children}</div>
          </main>
        </div>

        <IdleLogoutModal
          open={idle.showModal}
          seconds={idle.seconds}
          onContinue={idle.continueSession}
          onLogout={idle.logoutNow}
        />
      </MustChangePasswordGate>
    </RequireAuth>
  );
}