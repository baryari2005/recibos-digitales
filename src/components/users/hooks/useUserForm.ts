// src/features/users/hooks/useUserForm.ts
"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import { createUserSchema, editUserSchema } from "@/features/users/schemas";
import { normalize, pathFromPublicUrl } from "@/features/users/utils";
import { useRoles } from "@/features/users/hooks/useRoles";
import { useAvatarStaging } from "@/features/users/hooks/useAvatarStaging";
import { createUser, updateUser } from "@/features/users/api";
import type { UserFormValues } from "../types";

type Mode = "create" | "edit";

// ---- helpers fecha ----
function toYmdUTC(d?: Date | null): string | null {
  if (!d) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Type guard seguro para Date (evita TS2358)
function isDateValue(v: unknown): v is Date {
  return v instanceof Date && !isNaN(v.getTime());
}

export function useUserForm({
  mode,
  defaultValues,
  onSuccess,
}: {
  mode: Mode;
  defaultValues?: Partial<UserFormValues> & {
    id?: string;
    rol?: { id: number };
    fechaNacimiento?: string | Date | null;
  };
  onSuccess?: (id: string) => void;
}) {
  const schema = mode === "create" ? createUserSchema : editUserSchema;

  const derivedDefaults = useMemo<UserFormValues>(() => {
    const rawFN = defaultValues?.fechaNacimiento;

    let fh: string | null = null;
    if (typeof rawFN === "string") {
      fh = rawFN;                         // ya "yyyy-MM-dd"
    } else if (isDateValue(rawFN)) {
      fh = toYmdUTC(rawFN);               // Date -> "yyyy-MM-dd"
    } // si no, queda null

    return {
      userId: defaultValues?.userId ?? "",
      email: defaultValues?.email ?? "",
      password: "",

      nombre: defaultValues?.nombre ?? "",
      apellido: defaultValues?.apellido ?? "",
      avatarUrl: defaultValues?.avatarUrl ?? "",

      rolId: defaultValues?.rolId ?? defaultValues?.rol?.id ?? 1,

      // Identidad / contacto
      tipoDocumento: (defaultValues?.tipoDocumento as UserFormValues["tipoDocumento"]) ?? undefined,
      documento: defaultValues?.documento ?? "",
      cuil: defaultValues?.cuil ?? "",
      celular: defaultValues?.celular ?? "",
      domicilio: defaultValues?.domicilio ?? "",
      codigoPostal: defaultValues?.codigoPostal ?? "",

      // Demográficos
      fechaNacimiento: fh, // string | null ("yyyy-MM-dd")
      genero: (defaultValues?.genero as UserFormValues["genero"]) ?? undefined,
      estadoCivil: (defaultValues?.estadoCivil as UserFormValues["estadoCivil"]) ?? undefined,
      nacionalidad: (defaultValues?.nacionalidad as UserFormValues["nacionalidad"]) ?? undefined,
    };
  }, [defaultValues]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: derivedDefaults,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(derivedDefaults);
  }, [derivedDefaults, form]);

  const submitting = form.formState.isSubmitting;
  const { roles, loading: loadingRoles } = useRoles();

  const { tmpPath, setTmpPath, commit } = useAvatarStaging();
  const oldAvatarPath = pathFromPublicUrl(defaultValues?.avatarUrl || undefined);

  const toNull = (v: unknown) => (v === "" || v === undefined ? null : (v as any));

  const onSubmit = async (values: UserFormValues) => {
    try {
      const emailNorm = values.email.trim().toLowerCase();

      const payloadDemograficos = {
        fechaNacimiento: values.fechaNacimiento ?? null, // string | null
        genero: values.genero ?? null,
        estadoCivil: values.estadoCivil ?? null,
        nacionalidad: values.nacionalidad ?? null,
      };

      const payloadIdentidadContacto = {
        tipoDocumento: values.tipoDocumento ?? null,
        documento: toNull(values.documento?.trim()),
        cuil: toNull(values.cuil?.trim()),
        celular: toNull(values.celular?.trim()),
        domicilio: toNull(values.domicilio?.trim()),
        codigoPostal: toNull(values.codigoPostal?.trim()),
      };

      const basePayload: any = {
        userId: values.userId.trim(),
        email: emailNorm,
        password: values.password,
        nombre: normalize(values.nombre),
        apellido: normalize(values.apellido),
        rolId: Number(values.rolId) || 1,
        ...payloadDemograficos,
        ...payloadIdentidadContacto,
      };

      if (mode === "edit" && (!basePayload.password || !basePayload.password.trim())) {
        delete basePayload.password;
      }

      if (mode === "create") {
        const created = await createUser(basePayload);
        if (tmpPath) {
          try {
            const r = await commit(`users/${created.id}`);
            await updateUser(created.id, { avatarUrl: r.publicUrl });
          } catch {}
        }
        toast.success("Usuario creado correctamente");
        onSuccess?.(created.id);
      } else {
        const id = defaultValues?.id as string;
        if (!id) throw new Error("Falta el id del usuario para actualizar");

        await updateUser(id, basePayload);
        if (tmpPath) {
          try {
            const r = await commit(`users/${id}`, oldAvatarPath);
            await updateUser(id, { avatarUrl: r.publicUrl });
          } catch {}
        }
        toast.success("Usuario actualizado correctamente");
        onSuccess?.(id);
      }
    } catch (err: any) {
      const ax = err as AxiosError<{ message?: string | string[] }>;
      const status = ax.response?.status;
      const rawMsg = ax.response?.data?.message;
      const serverMsg = Array.isArray(rawMsg) ? rawMsg.join(", ") : rawMsg || err.message || "Error al guardar";

      toast.error(serverMsg);

      if (status === 409) {
        if (/email/i.test(serverMsg)) form.setError("email", { type: "server", message: "El email ya está registrado." });
        if (/userId/i.test(serverMsg)) form.setError("userId", { type: "server", message: "El usuario (userId) ya existe." });
        if (/documento/i.test(serverMsg)) form.setError("documento", { type: "server", message: "El documento ya está registrado." });
        if (/CUIL|cuil/i.test(serverMsg)) form.setError("cuil", { type: "server", message: "El CUIL ya está registrado." });
      }
      throw err;
    }
  };

  return {
    form,
    onSubmit,
    submitting,
    roles,
    loadingRoles,
    setTmpPath: (p: string) => setTmpPath(p),
  };
}
