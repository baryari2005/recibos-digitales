"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise } from "lucide-react";
import { AdminLeavesList } from "@/features/leaves/ui/AdminLeavesList";

export default function AdminVacationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sunrise className="w-5 h-5" />
          Vacaciones pendientes de aprobación
        </CardTitle>
      </CardHeader>

      <CardContent>
        <AdminLeavesList type="VACACIONES" />
      </CardContent>
    </Card>
  );
}
