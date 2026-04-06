"use client";

import { Card } from "@/components/ui/card";
import { useCan } from "@/hooks/useCan";
import { useVacationBalanceAdmin } from "../../../features/vacation-balance/hooks/useVacationBalanceAdmin";
import { useVacationBalanceMutations } from "../../../features/vacation-balance/hooks/useVacationBalanceMutations";
import { VacationBalanceAdminHeader } from "../../../features/vacation-balance/components/VacationBalanceAdminHeader";
import { VacationBalanceAdminContent } from "../../../features/vacation-balance/components/VacationBalanceAdminContent";
import { VacationBalanceAdminDialogs } from "../../../features/vacation-balance/components/VacationBalanceAdminDialogs";
import AccessDenied403Page from "../403/page";

export default function VacationBalanceAdminPage() {
  const canAccess = useCan("vacaciones", "asignar");

  const {
    year,
    refreshVersion,
    editing,
    creating,
    bulkOpen,
    setEditing,
    setCreating,
    setBulkOpen,
    refresh,
  } = useVacationBalanceAdmin();

  const {
    creatingLoading,
    editingLoading,
    bulkLoading,
    handleCreate,
    handleEdit,
    handleBulkCreate,
  } = useVacationBalanceMutations(refresh);

  if (!canAccess) {
    return <AccessDenied403Page />;
  }

  return (
    <Card>
      <VacationBalanceAdminHeader
        year={year}
        onOpenBulk={() => setBulkOpen(true)}
        onOpenCreate={() => setCreating(true)}
      />

      <VacationBalanceAdminContent
        refreshToken={refreshVersion}
        onEdit={setEditing}
        onDeleted={async () => {
          refresh();
        }}
      />

      <VacationBalanceAdminDialogs
        year={year}
        editing={editing}
        creating={creating}
        bulkOpen={bulkOpen}
        createLoading={creatingLoading}
        editLoading={editingLoading}
        bulkLoading={bulkLoading}
        onCloseEdit={() => setEditing(null)}
        onCloseCreate={() => setCreating(false)}
        onCloseBulk={() => setBulkOpen(false)}
        onCreate={handleCreate}
        onEditSave={handleEdit}
        onBulkCreate={handleBulkCreate}
      />
    </Card>
  );
}