"use client";

import { usePathname, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
    Home,
    FileSignature,
    Sunrise,
    ClipboardList,
    FileSearch2,
    CalendarDays,
    HelpCircle,
    Menu,
    SunriseIcon,
    UserCog,
    Import,
} from "lucide-react";

import { SidebarNavIcon } from "./SidebarNavIcon";
import { SidebarSection } from "./SidebarSection";
import { CurrentUser } from "@/features/auth/types";
import { usePendingLeaves } from "@/features/leaves/hooks/usePendingLeaves";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExportIcon } from "@/components/icons/ExportIcon";

type Props = {
    user?: CurrentUser | null;
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function Sidebar({ user, collapsed, setCollapsed }: Props) {
    const pathname = usePathname();
    const router = useRouter();

    const isAdmin =
        (user?.rol?.nombre?.toLowerCase() ?? "") === "administrador";

    const { count: pendingVacation } = usePendingLeaves({ type: "VACACIONES" });
    const { count: pendingLicenses } = usePendingLeaves({ type: "OTHER" });

    return (
        <aside
            className="
                    h-full
                    bg-[#008C93]
                    text-white
                    flex flex-col
                    transition-all duration-300
                    "
        >
            {/* Toggle */}
            <div className="flex items-center justify-center py-4">
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className={`
                                        flex items-center transition-all duration-200
                                        ${collapsed
                                        ? "justify-center w-12 h-12"
                                        : "justify-start gap-2 px-3 py-2 w-full"}
                                        text-white hover:bg-white/10 rounded-md
                                `}
                            >
                                <Menu className="w-5 h-5" />
                                {!collapsed && (
                                    <span className="text-sm font-medium">Menú</span>
                                )}
                            </button>
                        </TooltipTrigger>
                        {collapsed && (
                            <TooltipContent side="right">
                                Expandir menú
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>

            <Separator className="bg-white/20" />

            {/* GENERAL */}
            <SidebarSection label="General" collapsed={collapsed} />

            <SidebarNavIcon
                Icon={Home}
                href="/"
                title="Inicio"
                active={pathname === "/"}
                collapsed={collapsed}
            />

            <Separator className="bg-white/20" />

            {!isAdmin && (
                <>
                    <SidebarSection label="Documentos" collapsed={collapsed} />

                    <SidebarNavIcon
                        Icon={FileSignature}
                        title="Mis Documentos"
                        active={pathname.startsWith("/receipts")}
                        collapsed={collapsed}
                        onClick={() => {
                            if (pathname.startsWith("/receipts")) {
                                router.push(`/receipts?v=${Date.now()}`);
                            } else {
                                router.push("/receipts");
                            }
                        }}
                    />
                    <Separator className="bg-white/20" />
                    <SidebarSection label="Solicitudes" collapsed={collapsed} />

                    <SidebarNavIcon
                        Icon={Sunrise}
                        href="/vacations"
                        title="Vacaciones"
                        active={pathname.startsWith("/vacations")}
                        collapsed={collapsed}
                    />

                    <SidebarNavIcon
                        Icon={ClipboardList}
                        href="/licenses"                        
                        title="Licencias"
                        active={pathname.startsWith("/licenses")}
                        collapsed={collapsed}
                    />
                </>
            )}

            {isAdmin && (
                <>
                    <SidebarSection label="Gestión Usuarios" collapsed={collapsed} />

                    <SidebarNavIcon
                        Icon={UserCog}
                        href="/users"
                        title="Administrar"
                        active={pathname.startsWith("/users")}
                        collapsed={collapsed}
                    />

                    <SidebarNavIcon
                        Icon={Import}
                        href="/users/import"
                        title="Importar"
                        active={pathname.endsWith("import")}
                        collapsed={collapsed}
                    />
                    
                    <SidebarNavIcon
                        Icon={ExportIcon}
                        href="/users/export"
                        title="Exportar"
                        active={pathname.endsWith("export")}
                        collapsed={collapsed}
                    /> 
                    

                    <Separator className="bg-white/20" />
                    <SidebarSection label="Gestión Recibos y Vacaciones" collapsed={collapsed} />

                    <SidebarNavIcon
                        Icon={FileSearch2}
                        href="/payroll/receipts"
                        title="Seguimiento Recibos"
                        active={pathname.startsWith("/payroll/receipts")}
                        collapsed={collapsed}
                    />

                    <SidebarNavIcon
                        Icon={CalendarDays}
                        href="/vacation-balance"
                        title="Balance Vacaciones"
                        active={pathname.startsWith("/vacation-balance")}
                        collapsed={collapsed}
                    />

                    <Separator className="bg-white/20" />
                    <SidebarSection label="Aprobaciones" collapsed={collapsed} />

                    <SidebarNavIcon
                        Icon={SunriseIcon}
                        href="/admin/vacations"
                        title="Vacaciones"
                        active={pathname.startsWith("/admin/vacations")}
                        collapsed={collapsed}
                        badgeCount={pendingVacation}
                        highlight={pendingVacation > 0}
                    />

                    <SidebarNavIcon
                        Icon={ClipboardList}
                        href="/admin/licenses"
                        title="Licencias"
                        active={pathname.startsWith("/admin/licenses")}
                        collapsed={collapsed}
                        badgeCount={pendingLicenses}
                        highlight={pendingLicenses > 0}
                    />
                </>
            )}

            <div className="mt-auto mb-4">
                <Separator className="bg-white/20 mb-2" />
                <SidebarNavIcon
                    Icon={HelpCircle}
                    title="Ayuda"
                    collapsed={collapsed}
                />
            </div>
        </aside>
    );
}