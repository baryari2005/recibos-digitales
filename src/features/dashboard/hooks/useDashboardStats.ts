"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNextHoliday } from "@/features/dashboard/hooks/calendar/useNextHoliday";
import { usePendingDocuments } from "@/features/dashboard/hooks/usePendingDocuments";
import { useVacationBalance } from "@/features/vacation-balance/hooks/useVacationBalance";
import { usePendingLeaves } from "@/features/leaves/hooks/usePendingLeaves";
import { buildDashboardStats } from "../lib/stats/buildDashboardStats";
import { useCan } from "@/hooks/useCan";

export function useDashboardStats() {
  const router = useRouter();
  const pathname = usePathname();

  const canApproveVacation = useCan("vacaciones", "aprobar");
  const canLoadVacation = useCan("vacaciones", "cargar");

  const canApproveLicences = useCan("licencias", "aprobar");
  const canLoadLicences = useCan("licencias", "cargar");

  const canViewDocuments = useCan("recibos", "ver");

  const { data: nextHoliday, loading: loadingHoliday } = useNextHoliday("AR");
  const { count: pendingDocs, loading: loadingDocs } = usePendingDocuments();
  const { balance, isLoading: loadingBalance } = useVacationBalance();

  const { count: pendingVacationLeaves, loading: loadingVacationLeaves } =
    usePendingLeaves({ type: "VACACIONES" });

  const { count: pendingOtherLeaves, loading: loadingOtherLeaves } =
    usePendingLeaves({ type: "OTHER" });

  const stats = useMemo(() => {
    return buildDashboardStats({
      documents: {
        canApprove: false,
        canLoad: false,
        canView: canViewDocuments,
        loadingDocs,
        pendingDocs,
        pathname,
        onGoReceipts: () => {
          if (pathname.startsWith("/receipts")) {
            router.push(`/receipts?v=${Date.now()}`);
          } else {
            router.push("/receipts");
          }
        },
      },
      vacations: {
        canApprove: canApproveVacation,
        canLoad: canLoadVacation,
        canView: false,
        loadingBalance,
        availableDays: balance?.available ?? 0,
        loadingVacationLeaves,
        pendingVacationLeaves,
        onGoVacations: () => {
          const target = canApproveVacation
            ? "/admin/vacations?type=VACACIONES"
            : canLoadVacation
              ? "/vacations"
              : null;

          if (!target) return;

          router.push(target);
        },
      },
      licenses: {
        canApprove: canApproveLicences,
        canLoad: canLoadLicences,
        canView: false,
        loadingOtherLeaves,
        pendingOtherLeaves,
        onGoLicenses: () => {
          const target = canApproveLicences
            ? "/admin/licenses?type=OTHER"
            : canLoadLicences
              ? "/licenses"
              : null;

          if (!target) return;

          router.push(target);
        },
      },
      holiday: {
        loadingHoliday,
        nextHoliday,
      },
    });
  }, [
    canApproveLicences,
    canApproveVacation,
    canLoadLicences,
    canLoadVacation,
    canViewDocuments,
    loadingDocs,
    pendingDocs,
    pathname,
    loadingBalance,
    balance,
    loadingVacationLeaves,
    pendingVacationLeaves,
    loadingOtherLeaves,
    pendingOtherLeaves,
    loadingHoliday,
    nextHoliday,
    router,
  ]);

  return { stats };
}