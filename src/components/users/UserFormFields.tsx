"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleSelect } from "./RoleSelect";
import type { UserFormValues } from "./hooks/useUserForm";
import { IconInput } from "../inputs/IconInput";
import { CalendarIcon, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NACIONALIDAD_VALUES } from "@/constants/nacionalidad";
import { GENERO_OPCIONES } from "@/constants/genero";
import { ESTADO_CIVIL_OPCIONES } from "@/constants/estadocivil";



type Mode = "create" | "edit";

export function UserFormFields({
  mode,
  form,
  roles,
  loadingRoles,
}: {
  mode: Mode;
  form: UseFormReturn<UserFormValues>;
  roles: Array<{ id: number; nombre: string }>;
  loadingRoles: boolean;
  currentAvatarUrl?: string | null;
  onTempAvatarUploaded: (tmpPath: string) => void;
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const [show, setShow] = useState(false);
  const rolValue = watch("rolId");

  return (
    <>
      <div className="space-y-1">
        <Label>Usuario  <p className="text-xs text-muted-foreground">ID único de login (no el email).</p></Label>
        <Input
          {...register("userId")}
          readOnly={mode === "edit"}
          aria-readonly={mode === "edit"}
          className={cn(
            "h-11 rounded border pr-3",
            mode === "edit" && "bg-muted/50 cursor-not-allowed text-muted-foreground"
          )}
          onKeyDown={(e) => { if (mode === "edit") e.preventDefault(); }} // bloquea tipeo
          onPaste={(e) => { if (mode === "edit") e.preventDefault(); }}  // bloquea pegar
        />
        {errors.userId && (
          <p className="text-xs text-red-600">{errors.userId.message as string}</p>
        )}

      </div>

      <div className="space-y-1">
        <Label>Rol</Label>
        <RoleSelect
          value={rolValue == null ? "" : String(rolValue)}        // 👈 string o ""
          onChange={(v) => setValue("rolId", Number(v), {         // 👈 convertís a number
            shouldValidate: true,
            shouldDirty: true,
          })}
          roles={roles}
          disabled={loadingRoles || isSubmitting}
        />
        {errors.rolId && (
          <p className="text-xs text-red-600">{errors.rolId.message as string}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Email</Label>
        <Input type="email" {...register("email")} className="h-11 rounded border pr-3" autoComplete="email" />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message as string}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>{mode === "create" ? "Contraseña" : "Nueva contraseña (opcional)"}</Label>
        <IconInput
          id="password"
          leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
          rightAdornment={
            <button type="button" onClick={() => setShow(s => !s)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {show ? <EyeOff className="h-5 w-5 text-muted-foreground" /> :
                <Eye className="h-5 w-5 text-muted-foreground" />}
            </button>
          }
          input={
            <Input id="password" type={show ? "text" : "password"} autoComplete="current-password"
              {...register("password")} aria-invalid={!!errors.password} className="h-11 rounded border pl-9 pr-10" />
          }
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message as string}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Nombre</Label>
        <Input {...register("nombre")} className="h-11 rounded border pr-3" />
      </div>

      <div className="space-y-1">
        <Label>Apellido</Label>
        <Input {...register("apellido")} className="h-11 rounded border pr-3" />
      </div>


      <div className="space-y-1">
        <Label>Fecha de nacimiento</Label>
        <Controller
          control={form.control}
          name="fechaNacimiento"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full justify-start h-11 rounded border"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {field.value
                    ? format(field.value, "dd/MM/yyyy", { locale: es })
                    : <span className="text-muted-foreground">Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ?? undefined}
                  onSelect={(d) => field.onChange(d ?? null)}
                  initialFocus
                  captionLayout="dropdown"
                  fromYear={1940}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {form.formState.errors.fechaNacimiento && (
          <p className="text-xs text-red-600">
            {form.formState.errors.fechaNacimiento.message as string}
          </p>
        )}
      </div>

      {/* Género */}
      <div className="space-y-1">
        <Label>Género</Label>
        <Controller
          control={form.control}
          name="genero"
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={(v) => field.onChange(v || undefined)}
            >
              <SelectTrigger className="h-11 rounded border w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {GENERO_OPCIONES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g.replaceAll("_", " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Estado civil */}
      <div className="space-y-1">
        <Label>Estado civil</Label>
        <Controller
          control={form.control}
          name="estadoCivil"
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={(v) => field.onChange(v || undefined)}
            >
              <SelectTrigger className="h-11 rounded border w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {ESTADO_CIVIL_OPCIONES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e.charAt(0) + e.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Nacionalidad */}
      <div className="space-y-1">
        <Label>Nacionalidad</Label>
        <Controller
          control={form.control}
          name="nacionalidad"
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={(v) => field.onChange(v || undefined)}
            >
              <SelectTrigger className="h-11 rounded border w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {NACIONALIDAD_VALUES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e.charAt(0) + e.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {/* <div className="md:col-span-2 space-y-1">
        <Label>Avatar</Label>
        <AvatarUploader
          currentUrl={currentAvatarUrl || undefined}
          onTempUploaded={({ tmpPath }) => onTempAvatarUploaded(tmpPath)}
          disabled={isSubmitting}
        />
      </div> */}
    </>
  );
}
