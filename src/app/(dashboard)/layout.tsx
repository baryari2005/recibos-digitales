// "use client";

// import type { ReactNode } from "react";
// import { RequireAuth } from "@/components/auth/RequireAuth";
// import { MustChangePasswordGate } from "@/components/auth/MustChangePasswordGate";

// import { Topbar } from "@/components/dashboard/Topbar";
// import type { CurrentUser } from "@/features/auth/types";
// import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

// // ⏳ Idle session
// import { useIdleLogout } from "@/features/auth/hooks/useIdleLogout";
// import { IdleLogoutModal } from "@/features/auth/components/IdleLogoutModal";
// import { Sidebar } from "@/components/dashboard/sidebar/Sidebar";

// type Props = {
//   children: ReactNode;
// };

// export default function DashboardRootLayout({ children }: Props) {
//   const { user } = useCurrentUser();

//   // 🔐 Logout centralizado
//   const logout = () => {
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

//   // ⏱ Hook de inactividad
//   const idle = useIdleLogout(logout);

//   return (
//     <RequireAuth>
//       <MustChangePasswordGate>
//         <div
//           className="
//             min-h-screen grid
//             grid-cols-[var(--sidebar-w)_1fr]
//             grid-rows-[var(--topbar-h)_1fr]
//             bg-muted/30
//           "
//           style={
//             {
//               ["--sidebar-w" as any]: "90px",
//               ["--topbar-h" as any]: "84px",
//               ["--content-pad" as any]: "20px",
//             } as React.CSSProperties
//           }
//         >
//           {/* Sidebar */}
//           <aside className="row-[1/3] col-[1/2]">
//             <Sidebar user={user as CurrentUser | null} />
//           </aside>

//           {/* Topbar */}
//           <header className="col-[2/3] row-[1/2] sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//             <Topbar />
//           </header>

//           {/* Contenido */}
//           <main className="col-[2/3] row-[2/3] min-w-0">
//             <div className="p-[var(--content-pad)]">{children}</div>
//           </main>
//         </div>

//         {/* 🔔 Modal de sesión por expirar */}
//         <IdleLogoutModal
//           open={idle.showModal}
//           seconds={idle.seconds}
//           onContinue={idle.continueSession}
//           onLogout={idle.logoutNow}
//         />
//       </MustChangePasswordGate>
//     </RequireAuth>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { MustChangePasswordGate } from "@/components/auth/MustChangePasswordGate";
import { Topbar } from "@/components/dashboard/Topbar";
import type { CurrentUser } from "@/features/auth/types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useIdleLogout } from "@/features/auth/hooks/useIdleLogout";
import { IdleLogoutModal } from "@/features/auth/components/IdleLogoutModal";
import { Sidebar } from "@/components/dashboard/sidebar/Sidebar";
import { Menu } from "lucide-react";

type Props = {
  children: ReactNode;
};

export default function DashboardRootLayout({ children }: Props) {
  const { user } = useCurrentUser();

  const [collapsed, setCollapsed] = useState(false);

  // 🔥 Persistencia real del estado
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
          style={
            {
              ["--sidebar-w" as any]: collapsed ? "72px" : "240px",
              ["--topbar-h" as any]: "84px",
              ["--content-pad" as any]: "20px",
              gridTemplateColumns: "var(--sidebar-w) 1fr",
              gridTemplateRows: "var(--topbar-h) 1fr",
            } as React.CSSProperties
          }
        >
          {/* Sidebar */}
          <aside className="row-[1/3] col-[1/2] lg:relative fixed z-40">
            <Sidebar
              user={user as CurrentUser | null}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />
          </aside>

          {/* Topbar */}
          <header className="col-[2/3] row-[1/2] sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Topbar />
          </header>

          {/* Contenido */}
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