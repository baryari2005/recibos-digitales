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

export function useUserForm({
  mode,
  defaultValues,
  onSuccess,
}: {
  mode: Mode;
  defaultValues?: Partial<UserFormValues> & {
    id?: string;                              // 👈 id solo en los defaults (no en el form)
    rol?: { id: number };
    fechaNacimiento?: string | Date | null;
  };
  onSuccess?: (id: string) => void;
}) {
  const schema = mode === "create" ? createUserSchema : editUserSchema;

  const derivedDefaults = useMemo<UserFormValues>(() => {
    const fh =
      defaultValues?.fechaNacimiento == null
        ? null
        : typeof defaultValues.fechaNacimiento === "string"
          ? new Date(defaultValues.fechaNacimiento)
          : defaultValues.fechaNacimiento;

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
      fechaNacimiento: fh ?? null,
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

  // Rehidratar cuando llegan nuevos defaults (fetch)
  useEffect(() => {
    form.reset(derivedDefaults);
  }, [derivedDefaults, form]);

  const submitting = form.formState.isSubmitting;

  const { roles, loading: loadingRoles } = useRoles();

  const { tmpPath, setTmpPath, commit } = useAvatarStaging();
  const oldAvatarPath = pathFromPublicUrl(defaultValues?.avatarUrl || undefined);

  // helpers
  const toNull = (v: unknown) =>
    v === "" || v === undefined ? null : (v as any);

  const onSubmit = async (values: UserFormValues) => {
    try {
      const emailNorm = values.email.trim().toLowerCase();

      // Demográficos
      const payloadDemograficos = {
        fechaNacimiento: values.fechaNacimiento
          ? values.fechaNacimiento.toISOString()
          : null,
        genero: values.genero ?? null,
        estadoCivil: values.estadoCivil ?? null,
        nacionalidad: values.nacionalidad ?? null,
      };

      // Identidad / contacto
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

      // En edit, si no hay nueva pass, no la envíes
      if (mode === "edit" && (!basePayload.password || !basePayload.password.trim())) {
        delete basePayload.password;
      }

      if (mode === "create") {
        const created = await createUser(basePayload);

        if (tmpPath) {
          try {
            const r = await commit(`users/${created.id}`);
            await updateUser(created.id, { avatarUrl: r.publicUrl });
          } catch {
            /* no cortar flujo por avatar */
          }
        }

        toast.success("Usuario creado correctamente");
        onSuccess?.(created.id);
      } else {
        const id = defaultValues?.id as string;     // 👈 usamos el id del recurso desde props
        if (!id) throw new Error("Falta el id del usuario para actualizar");

        await updateUser(id, basePayload);

        if (tmpPath) {
          try {
            const r = await commit(`users/${id}`, oldAvatarPath);
            await updateUser(id, { avatarUrl: r.publicUrl });
          } catch {
            /* no cortar flujo por avatar */
          }
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

      // 409 → duplicados
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
