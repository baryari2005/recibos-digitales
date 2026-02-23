"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Sunrise } from "lucide-react";
import { VacationHistoryPanel } from "@/features/leaves/ui/VacationHistoryPanel";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
// import { AdminPendingLeavesPanel } from "@/features/leaves/ui/AdminPendingLeavesPanel";
import { useState } from "react";
import { VacationRequestPanel } from "@/features/leaves/ui/VacationRequestPanel";

export default function VacationsPage() {
  const { user } = useCurrentUser();
  const [refreshVersion, setRefreshVersion] = useState(0);

  const isAdmin =
    ["ADMIN", "RRHH", "ADMINISTRADOR"].includes(user?.rol?.nombre ?? "");

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center">
            <Sunrise className="mr-2" /> Vacaciones
          </CardTitle>
        </CardHeader>

        {/* 👇 Este CardContent es el que ocupa el alto */}
        <CardContent>
          {/* {isAdmin ?
            (<AdminPendingLeavesPanel />) : ( */}
              <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
                {/* Columna izquierda */}
                <Card className="h-[calc(100vh-230px)] overflow-hidden">
                  <CardContent className="h-full p-3">
                    <VacationRequestPanel
                      fixedType="VACACIONES"
                      onCreated={() => setRefreshVersion((v) => v + 1)} />
                  </CardContent>
                </Card>

                {/* Columna derecha */}
                <Card className="h-full">
                  <CardContent className="h-full p-3">
                    <VacationHistoryPanel
                      type="VACACIONES"
                      refreshToken={refreshVersion} />
                  </CardContent>
                </Card>
              </div>
            {/* ) */}
          {/* } */}
        </CardContent>
      </Card>
    </div>
  );
}
