"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { VacationRequestPanel } from "@/features/leaves/ui/VacationRequestPanel";
import { VacationHistoryPanel } from "@/features/leaves/ui/VacationHistoryPanel";
import { useState } from "react";
import { useCan } from "@/hooks/useCan";
import AccessDenied403Page from "../403/page";

export default function LicensesPage() {
  const [refreshVersion, setRefreshVersion] = useState(0);

  const canAccess = useCan("licencias", "cargar");
  if (!canAccess)
    return <AccessDenied403Page />

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center">
            <ClipboardList className="mr-2" />
            Licencias
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 items-stretch lg:grid-cols-[360px_1fr]">
            {/* Columna izquierda */}
            <Card className="h-full">
              <CardContent className="flex h-full flex-col p-3">
                <VacationRequestPanel
                  excludeTypes={["VACACIONES"]}
                  onCreated={() => setRefreshVersion((v) => v + 1)}
                />
              </CardContent>
            </Card>

            {/* Columna derecha */}
            <Card className="h-full">
              <CardContent className="h-full p-3">
                <VacationHistoryPanel
                  type="OTHER"
                  refreshToken={refreshVersion}
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};