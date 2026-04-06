"use client";

import Loading from "../../loading";
import { useCan } from "@/hooks/useCan";
import { useEditRole } from "../../../../features/roles/hooks/useEditRole";
import { EditRoleForm } from "../../../../features/roles/components/EditRoleForm";
import AccessDenied403Page from "../../403/page";



export default function EditRolePage() {
  const canEdit = useCan("roles", "editar");
  const editRole = useEditRole({ enabled: canEdit });

  if (!canEdit) {
    return <AccessDenied403Page />;
  }

  if (editRole.loading) {
    return <Loading />;
  }

  return <EditRoleForm {...editRole} />;
}