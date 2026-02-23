"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";
import { usePendingApprovals } from "@/features/leaves/hooks/usePendingApprovals";
import { CenteredSpinner } from "@/components/CenteredSpinner";
import { AdminLeavesList } from "@/features/leaves/ui/AdminLeavesList";

export default function AdminLeavesPage() {
  const { items, isLoading } = usePendingApprovals();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ClipboardCheck className="w-5 h-5" />
          Solicitudes pendientes
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <CenteredSpinner label="Cargando..." />
        ) : (
          <AdminLeavesList />
        )}
      </CardContent>
    </Card>
  );
}
