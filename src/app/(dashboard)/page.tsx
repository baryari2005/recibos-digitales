"use client";

import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { QuoteBannerSmart } from "@/components/dashboard/QuoteBannerSmart";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { CalendarPanel } from "@/components/dashboard/calendar/CalendarPanel";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import type { Stat } from "@/components/dashboard/types";
import { useNextHoliday } from "@/components/dashboard/calendar/hooks/useNextHoliday";
import { usePendingDocuments } from "@/components/dashboard/hooks/usePendingDocuments";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useVacationBalance } from "@/features/leaves/hooks/useVacationBalance";
import { usePendingLeaves } from "@/features/leaves/hooks/usePendingLeaves";

function fmt(d?: Date) {
  return d ? format(d, "dd/MM", { locale: es }) : "";
}

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const { data: nextHoliday, loading: loadingHoliday } = useNextHoliday("AR");
  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(" ").trim();
  const displayName = fullName || user?.userId || user?.email || "Usuario";
  const { count: pendingDocs, loading: loadingDocs } = usePendingDocuments();
  const { balance, isLoading: loadingBalance } = useVacationBalance();
  // const { count: pendingLeaves, loading: loadingLeaves } = usePendingLeaves();

  const { count: pendingVacationLeaves, loading: loadingVacationLeaves } =
    usePendingLeaves({ type: "VACACIONES" });

  const { count: pendingOtherLeaves, loading: loadingOtherLeaves } =
    usePendingLeaves({ type: "OTHER" });

  const roleId = Number(user?.rol?.id ?? 0);        // por si en prod viene "2" como string
  const roleName = (user?.rol?.nombre ?? "").trim().toUpperCase();

  const EMPLOYEE_ROLE_ID = 1; // USUARIO
  const ADMIN_ROLE_IDS = new Set<number>([2, 4]);   // ADMINISTRADOR y admin

  const isEmployee = roleId === EMPLOYEE_ROLE_ID || roleName === "USUARIO";
  const isAdmin = ADMIN_ROLE_IDS.has(roleId) || ["ADMIN", "RRHH", "ADMINISTRADOR"].includes(roleName);

  console.log("roleName(prod):", roleName, "len:", roleName?.length);
  console.log("roleCode(prod):", roleId);

  const router = useRouter();
  const pathname = usePathname();

  const baseStats: (Stat & { disabled?: boolean; disabledHint?: string })[] = [
    // 🏖 VACACIONES
    {
      id: "vacations",
      labelTop: "Vacaciones",
      labelBottom: isEmployee
        ? "Días disponibles"
        : loadingVacationLeaves
          ? "Cargando…"
          : pendingVacationLeaves > 0
            ? "Vacaciones pendientes de aprobación"
            : "Sin pendientes",
      value: isEmployee
        ? loadingBalance
          ? "—"
          : balance?.available ?? 0
        : pendingVacationLeaves,
      iconName: "Sunrise",
      highlight: isAdmin && pendingVacationLeaves > 0,
      onClick: () => {
        if (isAdmin) {
          router.push("/admin/vacations?type=VACACIONES");
        } else {
          router.push("/vacations");
        }
      }
    },

    // 📝 LICENCIAS
    {
      id: "licenses",
      labelTop: "Licencias",
      labelBottom: loadingOtherLeaves
        ? "Cargando…"
        : pendingOtherLeaves > 0
          ? isAdmin
            ? "Licencias pendientes de aprobación"
            : "Pendientes de aprobación"
          : "Sin pendientes",
      value: pendingOtherLeaves,
      iconName: "ClipboardList",
      highlight: isAdmin && pendingOtherLeaves > 0,
      // disabled: true,
      // disabledHint: "Funcianalidad no implementada.",
      onClick: () => {
        if (isAdmin) {
          router.push("/admin/licenses?type=OTHER");
        } else {
          router.push("/licenses");
        }
      }
    }
  ];

  const documentsStat: Stat = {
    id: "documents",
    labelTop: "Documentos",
    labelBottom: loadingDocs
      ? "Comprobando…"
      : pendingDocs > 0
        ? "Pendientes por firmar"
        : "Sin pendientes",
    value: pendingDocs, // 0 o 1
    iconName: "FileSignature",
    disabled: user?.rol?.id == 2 ? true : false,
    disabledHint: user?.rol?.id == 2 ? "Funcianalidad no disponible para usuario admin" : "",
    onClick: () => {
      if (pathname.startsWith("/receipts")) {
        router.push(`/receipts?v=${Date.now()}`); // fuerza “cambio” y refetch
      } else {
        router.push("/receipts");
      }
    }
    // si tu StatsPanel soporta click, podés pasarle un href
    // href: "/recibos?tab=pendientes",
  };

  const holidayLabelBottom = loadingHoliday
    ? "Cargando…"
    : nextHoliday?.base && nextHoliday?.nonWorking
      ? `${fmt(nextHoliday.base.date)} ${nextHoliday.base.name}\n${fmt(nextHoliday.nonWorking.date)} ${nextHoliday.nonWorking.type === "puente" ? "Feriado puente no laborable" : nextHoliday.nonWorking.name}`
      : "Sin datos";

  const holidayStat: Stat = {
    id: "holiday",
    labelTop: "Próximo feriado",
    labelBottom: holidayLabelBottom,
    value: loadingHoliday ? 0 : (nextHoliday?.daysUntilNonWorking ?? 0),
    // si es puente, usamos palmera; si no, el que prefieras
    iconName: nextHoliday?.nonWorking?.type === "puente" ? "Palmtree" : "Gift",
  };

  const stats = [documentsStat, ...baseStats, holidayStat];
  return (
    <div className="grid gap-6" >
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        <WelcomeBanner
          name={displayName}
          showClock
          dynamicClockByHour
          timeZone="America/Argentina/Buenos_Aires"
          withSeconds
          size="lg"
          height="normal"
          artImgClassName="h-50 md:h-40"
          artWrapperClassName="bg-[#E8FFE8] group-hover:bg-[#D7FFD7]"
        />
        <QuoteBannerSmart
          className="h-full"
          size="lg"
          height="normal" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <StatsPanel
          stats={stats}
          density="compact" />
        <CalendarPanel />
      </div>
    </div >);
}