// src/features/users/hooks/useUserForm.ts
"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { createUserSchema, editUserSchema } from "@/features/users/schemas";
import { normalize, pathFromPublicUrl } from "@/features/users/utils";
import { useRoles } from "@/features/users/hooks/useRoles";
import { useAvatarStaging } from "@/features/users/hooks/useAvatarStaging";
import { createUser, updateUser } from "@/features/users/api";
import { Nacionalidad } from "@/constants/nacionalidad";
import { Genero } from "@/constants/genero";
import { EstadoCivil } from "@/constants/estadocivil";


// ---- Extendemos los valores del form con los 4 campos nuevos
export type UserFormValues = {
  id?: string;
  userId: string;
  email: string;
  password?: string;           // opcional en edit
  nombre?: string;
  apellido?: string;
  avatarUrl?: string | null;
  rolId?: number;

  // NUEVO
  fechaNacimiento?: Date | null;
  genero?: Genero;
  estadoCivil?: EstadoCivil;
  nacionalidad?: Nacionalidad;
};

type Mode = "create" | "edit";

export function useUserForm({
  mode,
  defaultValues,
  onSuccess,
}: {
  mode: Mode;
  // extendemos el defaultValues para aceptar también los nuevos campos
  defaultValues?: Partial<UserFormValues> & {
    rol?: { id: number };
    // por si llegan como string ISO desde el fetch:
    fechaNacimiento?: string | Date | null;
  };
  onSuccess?: (id: string) => void;
}) {
  const schema = mode === "create" ? createUserSchema : editUserSchema;

  // ⚠️ Mapeamos defaults cada vez que cambian los props (fetch async)
  const derivedDefaults = useMemo<UserFormValues>(() => {
    // fechaNacimiento puede venir como ISO string → la pasamos a Date
    const fh =
      defaultValues?.fechaNacimiento == null
        ? null
        : typeof defaultValues.fechaNacimiento === "string"
          ? new Date(defaultValues.fechaNacimiento)
          : defaultValues.fechaNacimiento;

    return {
      userId: defaultValues?.userId ?? "",
      email: defaultValues?.email ?? "",
      // en edición no rellenamos password
      password: "",
      nombre: defaultValues?.nombre ?? "",
      apellido: defaultValues?.apellido ?? "",
      avatarUrl: defaultValues?.avatarUrl ?? "",
      // acepta rolId directo o rol.id si viene poblado
      rolId: defaultValues?.rolId ?? defaultValues?.rol?.id ?? 1,
      id: defaultValues?.id,

      // NUEVO
      fechaNacimiento: fh ?? null,
      genero: (defaultValues?.genero as Genero) ?? undefined,
      estadoCivil: (defaultValues?.estadoCivil as EstadoCivil) ?? undefined,
      nacionalidad: (defaultValues?.nacionalidad as Nacionalidad) ?? undefined,
    };
  }, [defaultValues]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: derivedDefaults,     // sólo primer render
    mode: "onChange",
  });

  // 👇 Rehidrata el form cuando lleguen/ cambien los datos
  useEffect(() => {
    form.reset(derivedDefaults);
  }, [derivedDefaults, form]);

  const submitting = form.formState.isSubmitting;

  const { roles, loading: loadingRoles } = useRoles();

  const { tmpPath, setTmpPath, commit } = useAvatarStaging();
  const oldAvatarPath = pathFromPublicUrl(defaultValues?.avatarUrl || undefined);

  const onSubmit = async (values: UserFormValues) => {
    console.log("[FORM] values RHF =>", values);
    try {
      const emailNorm = values.email.trim().toLowerCase();

      // --- NUEVO: normalizamos y mapeamos los campos agregados
      const payloadExtra = {
        fechaNacimiento: values.fechaNacimiento
          ? values.fechaNacimiento.toISOString() // si tu API espera Date ISO; si espera Date, quitá el toISOString()
          : null,
        genero: values.genero ?? null,
        estadoCivil: values.estadoCivil ?? null,
        nacionalidad: values.nacionalidad
          ? normalize(values.nacionalidad)
          : null,
      };

      const basePayload: any = {
        userId: values.userId.trim(),
        email: emailNorm,
        password: values.password,
        nombre: normalize(values.nombre),
        apellido: normalize(values.apellido),
        rolId: Number(values.rolId) || 1,
        ...payloadExtra, // 👈 agregamos acá
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
            await updateUser(created.id, { avatarUrl: r.publicUrl }); // PATCH sólo avatar
          } catch {
            // no cortar el flujo por el avatar
          }
        }

        toast.success("Usuario creado correctamente");
        onSuccess?.(created.id);
      } else {
        const id = derivedDefaults.id as string;
        await updateUser(id, basePayload);

        if (tmpPath) {
          try {
            const r = await commit(`users/${id}`, oldAvatarPath);
            await updateUser(id, { avatarUrl: r.publicUrl });
          } catch {
            // no cortar el flujo por el avatar
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

      const msg =
        (Array.isArray(ax.response?.data?.message)
          ? ax.response?.data?.message.join(", ")
          : ax.response?.data?.message) || err.message || "Error al guardar";
      toast.error(msg);

      // 409 → duplicados
      if (status === 409) {
        if (/email/i.test(serverMsg)) form.setError("email", { type: "server", message: "El email ya está registrado." });
        if (/userId/i.test(serverMsg)) form.setError("userId", { type: "server", message: "El usuario (userId) ya existe." });
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
