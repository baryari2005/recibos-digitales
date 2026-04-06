"use client";

import { useEffect } from "react";
import type { FieldError, FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMessage } from "@/utils/formatters";

import { UserFormFields } from "./UserFormFields";
import { UserFormValues } from "../types/types";
import { useUserForm } from "../hooks/useUserForm";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  defaultValues?: Partial<UserFormValues> & {
    id?: string;
    rol?: { id: number };
  };
  onSuccess?: (id: string) => void;
};

function isFieldError(value: unknown): value is FieldError {
  return (
    !!value &&
    typeof value === "object" &&
    ("message" in value || "type" in value)
  );
}

function getFirstFieldError(
  errors: FieldErrors<UserFormValues>
): { name: string; error: FieldError } | null {
  for (const [name, value] of Object.entries(errors)) {
    if (isFieldError(value)) {
      return { name, error: value };
    }
  }

  return null;
}

export function UserForm({ mode, defaultValues, onSuccess }: Props) {
  const { form, onSubmit, submitting, roles, loadingRoles, setTmpPath } =
    useUserForm({ mode, defaultValues, onSuccess });

  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      Object.keys(form.formState.errors).length > 0
    ) {
      console.log("[RHF] errors", form.formState.errors);
    }
  }, [form.formState.errors]);

  const onInvalid = (errors: FieldErrors<UserFormValues>) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[RHF] onInvalid", errors);
    }

    const first = getFirstFieldError(errors);

    if (!first) {
      toast.error("Revisá los campos del formulario.");
      return;
    }

    const { name, error } = first;
    const msg =
      typeof error.message === "string"
        ? error.message
        : `Revisá el campo: ${name}`;

    toast.error(msg);

    const element =
      (document.querySelector(`[name="${name}"]`) as HTMLElement | null) ??
      (error.ref as HTMLElement | undefined) ??
      (document.getElementById(name) as HTMLElement | null);

    element?.focus?.();
  };

  return (
    <form
      id="user-form"
      className="w-full"
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
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

      <div className="mt-4 mb-4 md:col-span-2">
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
          disabled={submitting}
          aria-disabled={submitting}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              {formatMessage("Guardando...")}
            </span>
          ) : mode === "create" ? (
            <span className="inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Crear usuario
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Save className="h-4 w-4" />
              Guardar cambios
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}