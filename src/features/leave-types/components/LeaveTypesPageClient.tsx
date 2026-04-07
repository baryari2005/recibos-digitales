"use client";

import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCan } from "@/hooks/useCan";
import AccessDenied403Page from "@/app/(dashboard)/403/page";
import { useLeaveTypesCatalog } from "../hooks/useLeaveTypesCatalog";
import { LeaveTypesHeader } from "./LeaveTypesHeader";
import { LeaveTypesList } from "./LeaveTypesTable";

export function LeaveTypesPageClient() {
  const canView = useCan("tipo_licencia", "ver");
  const canCreate = useCan("tipo_licencia", "crear");

  const { items, isLoading } = useLeaveTypesCatalog(canView);

  if (!canView) {
    return <AccessDenied403Page />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <LeaveTypesHeader canCreate={canCreate} />
        <CardContent>
          {isLoading ? (
            <div className="flex text-sm text-muted-foreground">
              <Loader2 className="mr-4 h-4 w-4 animate-spin" />
              Cargando tipos de licencia...
            </div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No hay tipos de licencia creados.
            </div>
          ) : (
            <LeaveTypesList />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
