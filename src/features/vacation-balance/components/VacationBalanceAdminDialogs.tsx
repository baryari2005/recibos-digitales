"use client";

import { CreateVacationBalanceModal } from "@/features/vacation-balance/components/CreateVacationBalanceModal";
import { EditVacationBalanceModal } from "@/features/vacation-balance/components/EditVacationBalanceModal";
import { BulkCreateVacationBalanceDialog } from "@/features/vacation-balance/components/BulkCreateVacationBalanceDialog";
import type { VacationBalanceItem } from "@/features/vacation-balance/types/types";

type Props = {
  year: number;
  editing: VacationBalanceItem | null;
  creating: boolean;
  bulkOpen: boolean;
  createLoading: boolean;
  editLoading: boolean;
  bulkLoading: boolean;
  onCloseEdit: () => void;
  onCloseCreate: () => void;
  onCloseBulk: () => void;
  onCreate: (payload: {
    userId: string;
    year: number;
    totalDays: number;
  }) => Promise<void>;
  onEditSave: (id: string, totalDays: number) => Promise<void>;
  onBulkCreate: () => Promise<void>;
};

export function VacationBalanceAdminDialogs({
  year,
  editing,
  creating,
  bulkOpen,
  createLoading,
  editLoading,
  bulkLoading,
  onCloseEdit,
  onCloseCreate,
  onCloseBulk,
  onCreate,
  onEditSave,
  onBulkCreate,
}: Props) {
  return (
    <>
      <CreateVacationBalanceModal
        open={creating}
        loading={createLoading}
        onClose={onCloseCreate}
        onSave={onCreate}
      />

      <EditVacationBalanceModal
        open={!!editing}
        item={editing}
        loading={editLoading}
        onClose={onCloseEdit}
        onSave={onEditSave}
      />

      <BulkCreateVacationBalanceDialog
        open={bulkOpen}
        year={year}
        loading={bulkLoading}
        onClose={onCloseBulk}
        onConfirm={onBulkCreate}
      />
    </>
  );
}