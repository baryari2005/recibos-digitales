"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, Save, SaveAll } from "lucide-react";
import { Button } from "@/components/ui/button";

import { AdminVacationBalancesList } from "@/features/leaves/ui/AdminVacationBalancesList";
import { EditVacationBalanceModal } from "@/features/leaves/ui/EditVacationBalanceModal";
import { CreateVacationBalanceModal } from "@/features/leaves/ui/CreateVacationBalanceModal";
import { VacationBalanceItem } from "@/features/leaves/hooks/useVacationBalances";
import { BulkCreateVacationBalanceDialog } from "@/features/leaves/ui/BulkCreateVacationBalanceDialog";

export default function VacationBalanceAdminPage() {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [editing, setEditing] = useState<VacationBalanceItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const year = new Date().getFullYear();

  const token = localStorage.getItem("token");

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CalendarDays className="w-5 h-5" />
          Saldo de Vacaciones
        </CardTitle>

        <div className="flex gap-2">
          <Button
            size="lg"
            className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
            onClick={() => setBulkOpen(true)}
          >
            <SaveAll className="w-4 h-4" />
            Asignar saldo {year}
          </Button>

          <Button
            size="lg" className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
            onClick={() => setCreating(true)}
          >
            <Save className="w-4 h-4" />
            Asignar saldo por Usuario
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <AdminVacationBalancesList
          refreshToken={refreshVersion}
          onEdit={setEditing}
          onDeleted={() => setRefreshVersion((v) => v + 1)}
        />
      </CardContent>

      {/* Modales */}
      <CreateVacationBalanceModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => setRefreshVersion((v) => v + 1)}
      />

      <EditVacationBalanceModal
        open={!!editing}
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={() => setRefreshVersion((v) => v + 1)}
      />

      <BulkCreateVacationBalanceDialog
        open={bulkOpen}
        year={year}
        token={token}
        onClose={() => setBulkOpen(false)}
        onSuccess={() => setRefreshVersion((v) => v + 1)}
      />
    </Card>
  );
}