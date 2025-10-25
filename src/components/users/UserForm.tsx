// src/components/users/UserForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useUserForm } from "./hooks/useUserForm";
import { UserFormFields } from "./UserFormFields";
import { Loader2 } from "lucide-react";
import { formatMessage } from "@/utils/formatters";
import { UserFormValues } from "./types";
import { useMemo, useEffect } from "react";
import type { FieldErrors } from "react-hook-form";
import { toast } from "sonner";

type Mode = "create" | "edit";

export function UserForm({
  mode,
  defaultValues,
  onSuccess,
}: {
  mode: Mode;
  defaultValues?: Partial<UserFormValues> & { rol?: { id: number } };
  onSuccess?: (id: string) => void;
}) {
  const { form, onSubmit, submitting, roles, loadingRoles, setTmpPath } =
    useUserForm({ mode, defaultValues, onSuccess });

  // 👇 log automático cada vez que cambian los errores
  useEffect(() => {
    if (Object.keys(form.formState.errors).length) {
      console.log("[RHF] errors", form.formState.errors);
    }
  }, [form.formState.errors]);

  // 👇 capturamos errores de validación del resolver (Zod)
  const onInvalid = (errs: FieldErrors<UserFormValues>) => {
    console.log("[RHF] onInvalid", errs);
    const first = Object.entries(errs)[0] as [string, any] | undefined;
    if (first) {
      const [name, err] = first;
      const msg =
        err?.message ||
        err?.types && Object.values(err.types)[0] ||
        `Revisá el campo: ${name}`;
      toast.error(String(msg));

      // foco al input si es posible
      const el =
        (document.querySelector(`[name="${name}"]`) as HTMLElement | null) ??
        (document.getElementById(String(err?.ref?.id || name)) as HTMLElement | null);
      el?.focus?.();
    }
  };

  const handleSubmit = useMemo(
    () => form.handleSubmit(onSubmit, onInvalid),
    [form, onSubmit]
  );

  return (
    <form
      id="user-form"
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault(); // aseguramos que siempre pase por RHF
        handleSubmit();
      }}
      noValidate
    >
      <UserFormFields
        mode={mode}
        form={form}
        roles={roles}
        loadingRoles={loadingRoles}
        currentAvatarUrl={defaultValues?.avatarUrl || null}
        onTempAvatarUploaded={setTmpPath}
      />

      <div className="md:col-span-2 mt-4 mb-4">
        <Button
          type="submit"
          form="user-form"
          onClick={handleSubmit} // “doble seguro”
          size="lg"
          className="w-full h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
          disabled={submitting}
          aria-disabled={submitting}
        >
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
