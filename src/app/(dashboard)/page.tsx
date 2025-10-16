"use client";

import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { QuoteBannerSmart } from "@/components/dashboard/QuoteBannerSmart";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { CalendarPanel } from "@/components/dashboard/calendar/CalendarPanel";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import type { Stat } from "@/components/dashboard/types";
import { useNextHoliday } from "@/components/dashboard/hooks/useNextHoliday";
import { usePendingDocuments } from "@/components/dashboard/hooks/usePendingDocuments";

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const { data: nextHoliday, loading: loadingHoliday } = useNextHoliday("AR");
  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(" ").trim();
  const displayName = fullName || user?.userId || user?.email || "Usuario";
  const { count: pendingDocs, loading: loadingDocs } = usePendingDocuments();

  const baseStats: (Stat & { disabled?: boolean; disabledHint?: string })[] = [
    { id: "absences", labelTop: "Ausencias", labelBottom: "Pendientes de aprobación", value: 0, iconName: "ClipboardList", disabled: true, disabledHint: "Funcionalidad no implementada" },
    { id: "vacations", labelTop: "Vacaciones", labelBottom: "Días disponibles", value: 0, iconName: "Plane", disabled: true, disabledHint: "Funcionalidad no implementada" },];

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
    // si tu StatsPanel soporta click, podés pasarle un href
    // href: "/recibos?tab=pendientes",
  };

  const holidayStat: Stat =
  {
    id: "holiday", labelTop: "Próximo feriado",
    labelBottom: loadingHoliday ?
      "Cargando…" : nextHoliday ?
        nextHoliday.name : "Sin datos",
    value: loadingHoliday ? 0 : nextHoliday ?
      nextHoliday.daysUntil : 0, iconName: "Default",
  };

  const stats = [ documentsStat, ...baseStats, holidayStat];
  return (
    <div className="grid gap-6">
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
    </div>);
}