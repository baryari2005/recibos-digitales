// components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Calendar, ClipboardList, FileSignature, FileText, HelpCircle, Home, Import, Menu, Shield, UserRoundCog, Users,
  type LucideIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { CurrentUser } from "@/features/auth/types";
import { useEffect } from "react";

type NavIconProps = {
  Icon: LucideIcon;
  href?: string;
  title?: string;
  active?: boolean;
  btnSize?: number;      // px
  iconSize?: number;     // px
  btnClassName?: string;
  disabled?: boolean;           // 👈 nuevo
  disabledHint?: string;        // 👈 opcional
  onClick?: () => void;
};

function NavIcon({
  Icon,
  href,
  title,
  active,
  btnSize = 56,
  iconSize = 28,
  btnClassName,
  disabled = false,
  onClick,
  disabledHint = "Funcionalidad no implementada",
}: NavIconProps) {
  const clsActive = active ? "bg-white/15" : "";

  const iconEl = (
    <Icon
      // 👇 inline style fuerza el tamaño, aunque haya clases globales tipo .lucide { width:20px }
      style={{ width: iconSize, height: iconSize }}
      className="shrink-0"
      strokeWidth={2}                // opcional: más “grueso”
    />
  );

  return (
    <Button
      asChild={!!href && !disabled}                     // 👈 si está disabled, NO usamos Link
      size="icon"
      variant="ghost"
      disabled={disabled}                                // 👈 deshabilita estilos/aria
      onClick={onClick}
      aria-disabled={disabled || undefined}
      title={disabled ? disabledHint : title}
      className={[
        "text-white hover:bg-white/10",
        clsActive,
        btnClassName ?? "",
        disabled ? "opacity-50 cursor-not-allowed hover:bg-transparent" : "",
      ].join(" ")}
      style={{ width: btnSize, height: btnSize }}
    >
      {href && !disabled ? (
        <Link href={href} aria-label={title}>{iconEl}</Link>
      ) : (
        <span>{iconEl}</span>
      )}
    </Button>
  );
}

type SidebarProps = {
  user?: CurrentUser | null;   // 👈 recibimos el usuario (o null mientras carga)
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.log("[Sidebar] user recibido:", user);

  }, [user]);

  const isAdminByRole =
    (user?.rol?.nombre ?? "") === "admin";

  const isAdmin = isAdminByRole;

  const BTN = 40;  // probá 56/60/64
  const ICO = 26;  // probá 28/30

  return (
    <aside className="h-screen sticky top-0 bg-[#008C93] text-white flex flex-col items-center py-5 gap-4 w-[var(--sidebar-w)] shrink-0">
      <NavIcon Icon={Menu} title="Menú" btnSize={BTN} iconSize={ICO} disabled />
      <Separator className="my-2 bg-white/20 w-10" />
      <NavIcon Icon={Home} href="/" title="Inicio" active={pathname === "/"} btnSize={BTN} iconSize={ICO} />
      <NavIcon
        Icon={FileSignature}
        title="Documentos"
        active={pathname.startsWith("/receipts")}
        btnSize={BTN}
        iconSize={ICO}
        onClick={() => {
          if (pathname.startsWith("/receipts")) {
            router.push(`/receipts?v=${Date.now()}`); // 👈 fuerza “cambio” de ruta
          } else {
            router.push("/receipts");
          }
        }}
      />
      <NavIcon Icon={ClipboardList} title="Vacaciones" btnSize={BTN} iconSize={ICO} disabled
        disabledHint="Funcionalidad no implementada" />

      {/* --- Sección Gestión (solo Admin) --- */}
      {isAdmin && (
        <>
          <Separator className="my-2 bg-white/20 w-10" />
          <NavIcon
            Icon={Users}
            href="/users"
            title="ABM Usuarios"
            active={pathname.startsWith("/users")}
            btnSize={BTN}
            iconSize={ICO}
          />
          <NavIcon
            Icon={Import}
            href="/users/import"
            title="Importar Usuarios"
            active={pathname.startsWith("/users")}
            btnSize={BTN}
            iconSize={ICO}
          />
          <Separator className="my-2 bg-white/20 w-10" />
          <NavIcon
            Icon={FileText}
            href="/admin/docs"
            title="Subir PDF de recibos"
            active={pathname.startsWith("/admin/docs")}
            btnSize={BTN}
            iconSize={ICO}
          />
          {/* Agregá más íconos de gestión acá (Permisos, Auditoría, etc.) */}
        </>
      )}

      <div className="mt-auto">
        <Separator className="my-2 bg-white/20 w-10" />
        <NavIcon Icon={HelpCircle} title="Ayuda" btnSize={BTN} iconSize={ICO} />
      </div>

    </aside>
  );
}
