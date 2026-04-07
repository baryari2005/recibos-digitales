"use client";

import Loading from "../../loading";
import { useCan } from "@/hooks/useCan";
import AccessDenied403Page from "../../403/page";
import { LeaveTypeForm } from "@/features/leave-types/components/LeaveTypeForm";
import { useEditLeaveType } from "@/features/leave-types/hooks/useEditLeaveType";

export default function EditLeaveTypePage() {
  const canEdit = useCan("tipo_licencia", "editar");
  const editLeaveType = useEditLeaveType({ enabled: canEdit });

  if (!canEdit) {
    return <AccessDenied403Page />;
  }

  if (editLeaveType.loading) {
    return <Loading />;
  }

  return (
    <LeaveTypeForm
      title="Editar tipo de licencia"
      submitLabel="Guardar cambios"
      code={editLeaveType.code}
      label={editLeaveType.label}
      colorHex={editLeaveType.colorHex}
      isActive={editLeaveType.isActive}
      loading={editLeaveType.saving}
      error={editLeaveType.error}
      onCodeChange={editLeaveType.setCode}
      onLabelChange={editLeaveType.setLabel}
      onColorHexChange={editLeaveType.setColorHex}
      onIsActiveChange={editLeaveType.setIsActive}
      onSubmit={editLeaveType.handleSave}
      onCancel={editLeaveType.handleCancel}
    />
  );
}
