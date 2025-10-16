// UserForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useUserForm } from "./hooks/useUserForm";
import { UserFormFields } from "./UserFormFields";
import { Loader2 } from "lucide-react";
import { formatMessage } from "@/utils/formatters";
import type { UserFormValues } from "./hooks/useUserForm"; // 👈 importa el tipo

type Mode = "create" | "edit";

export function UserForm({
  mode,
  defaultValues,
  onSuccess,
}: {
  mode: Mode;
  // 👇 ahora podés pasar fechaNacimiento, genero, estadoCivil, nacionalidad, etc.
  defaultValues?: Partial<UserFormValues> & { rol?: { id: number } };
  onSuccess?: (id: string) => void;
}) {
  const { form, onSubmit, submitting, roles, loadingRoles, setTmpPath } =
    useUserForm({ mode, defaultValues, onSuccess });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <UserFormFields
        mode={mode}
        form={form}
        roles={roles}
        loadingRoles={loadingRoles}
        currentAvatarUrl={defaultValues?.avatarUrl || null}
        onTempAvatarUploaded={setTmpPath}
      />
      <div className="md:col-span-2 mt-4 mb-4">
        <Button type="submit" size="lg" className="w-full h-11 rounded bg-[#008C93] hover:bg-[#007381]" disabled={submitting}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              {formatMessage("Guardando...")}
            </span>
          ) : mode === "create" ? "Crear usuario" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
