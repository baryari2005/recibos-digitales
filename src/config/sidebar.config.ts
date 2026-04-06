import { ExportIcon } from "@/components/icons/ExportIcon";
import {
    Home,
    FileSignature,
    Sunrise,
    ClipboardList,
    FileSearch2,
    CalendarDays,
    UserCog,
    Import,    
    ShieldCheck,
    FileUp,
} from "lucide-react";
import { ComponentType, SVGProps } from "react";

type SidebarIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type SidebarItemConfig = {
    section: string;
    title: string;
    href: string;
    icon: SidebarIcon;
    permission?: { modulo: string; accion: string };
    badgeKey?: string;
};

export const SIDEBAR_CONFIG: SidebarItemConfig[] = [
    {
        section: "General",
        title: "Inicio",
        href: "/",
        icon: Home,
    },

    {
        section: "Documentos",
        title: "Mis Documentos",
        href: "/receipts",
        icon: FileSignature,
        permission: { modulo: "recibos", accion: "ver" },
    },

    {
        section: "Solicitudes",
        title: "Vacaciones",
        href: "/vacations",
        icon: Sunrise,
        permission: { modulo: "vacaciones", accion: "cargar" },
    },
    {
        section: "Solicitudes",
        title: "Licencias",
        href: "/licenses",
        icon: ClipboardList,
        permission: { modulo: "licencias", accion: "cargar" },
    },

    {
        section: "Gestión Usuarios",
        title: "Administrar",
        href: "/users",
        icon: UserCog,
        permission: { modulo: "usuarios", accion: "ver" },
    },
    {
        section: "Gestión Usuarios",
        title: "Roles y Permisos",
        href: "/roles",
        icon: ShieldCheck,
        permission: { modulo: "roles", accion: "ver" },
    },
    {
        section: "Gestión Usuarios",
        title: "Importar",
        href: "/users/import",
        icon: Import,
        permission: { modulo: "usuarios", accion: "importar" },
    },
    {
        section: "Gestión Usuarios",
        title: "Exportar",
        href: "/users/export",
        icon: ExportIcon,
        permission: { modulo: "usuarios", accion: "exportar" },
    },
    {
        section: "Gestión Recibos y Vacaciones",
        title: "Subir PDF de recibos",
        href: "/admin/docs",
        icon: FileUp,
        permission: { modulo: "recibos", accion: "subir" },
    },
    {
        section: "Gestión Recibos y Vacaciones",
        title: "Seguimiento Recibos",
        href: "/payroll/receipts",
        icon: FileSearch2,
        permission: { modulo: "recibos", accion: "seguimiento" },
    },
    {
        section: "Gestión Recibos y Vacaciones",
        title: "Balance Vacaciones",
        href: "/vacation-balance",
        icon: CalendarDays,
        permission: { modulo: "vacaciones", accion: "asignar" },
    },
    {
        section: "Aprobaciones",
        title: "Vacaciones",
        href: "/admin/vacations",
        icon: Sunrise,
        permission: { modulo: "vacaciones", accion: "ver" },
        badgeKey: "pendingVacation",
    },
    {
        section: "Aprobaciones",
        title: "Licencias",
        href: "/admin/licenses",
        icon: ClipboardList,
        permission: { modulo: "licencias", accion: "ver" },
        badgeKey: "pendingLicenses",
    },
];