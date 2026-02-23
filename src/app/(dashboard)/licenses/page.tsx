"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { VacationRequestPanel } from "@/features/leaves/ui/VacationRequestPanel";
import { VacationHistoryPanel } from "@/features/leaves/ui/VacationHistoryPanel";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
// import { AdminPendingLeavesPanel } from "@/features/leaves/ui/AdminPendingLeavesPanel";
import { useState } from "react";
import { redirect } from "next/navigation";


export default function LicensesPage() {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const { user } = useCurrentUser();

  const isApprover =
    ["ADMIN", "RRHH", "ADMINISTRADOR"].includes(
      user?.rol?.nombre ?? ""
    );

  // Sacar cuando le demos la solucion
  redirect("/coming-soon");
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
          {/* {isApprover ? (
            <AdminPendingLeavesPanel type="OTHER" />
          ) : ( */}
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
            <Card className="h-[calc(100vh-230px)] overflow-hidden">
              <CardContent className="h-full p-3">
                <VacationRequestPanel
                  excludeTypes={["VACACIONES"]}
                  onCreated={() => setRefreshVersion(v => v + 1)}
                />
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent className="h-full p-3">
                <VacationHistoryPanel
                  type="OTHER"
                  refreshToken={refreshVersion} />
              </CardContent>
            </Card>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
