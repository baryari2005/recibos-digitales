// src/components/users/LegajoForm.tsx
"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { legajoSchema, type LegajoValues } from "@/lib/validations/legajo.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { formatMessage } from "@/utils/formatters";
import { CuilInput } from "@/components/inputs/CuilInput";

const DOC_TYPES = ["DNI", "PAS", "LE", "LC", "CI"] as const;
const EMPLOYMENT_STATUS = ["ACTIVO", "SUSPENDIDO", "LICENCIA", "BAJA"] as const;
const CONTRACT_TYPES = ["INDETERMINADO", "PLAZO_FIJO", "TEMPORAL", "PASANTIA", "MONOTRIBUTO"] as const;

/** Acepta "YYYY-MM-DD", ISO, o vacío y devuelve "YYYY-MM-DD" o "" */
const toInputDate = (v?: string | null) => {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; // ya viene bien
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

type Props = {
  defaultValues: Partial<LegajoValues>;
  onSubmit: (v: LegajoValues) => Promise<void>;
};

export function LegajoForm({ defaultValues, onSubmit }: Props) {
  const form = useForm<LegajoValues>({
    resolver: zodResolver(legajoSchema),
    defaultValues: {
      employeeNumber: defaultValues.employeeNumber ?? undefined,
      documentType: defaultValues.documentType ?? undefined,
      documentNumber: defaultValues.documentNumber ?? "",
      cuil: defaultValues.cuil ?? "",
      admissionDate: toInputDate(defaultValues.admissionDate),
      terminationDate: toInputDate(defaultValues.terminationDate),
      employmentStatus: defaultValues.employmentStatus ?? "ACTIVO",
      contractType: defaultValues.contractType ?? undefined,
      position: defaultValues.position ?? "",
      area: defaultValues.area ?? "",
      department: defaultValues.department ?? "",
      category: defaultValues.category ?? "",
      notes: defaultValues.notes ?? "",
    },
    mode: "onSubmit",
  });

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = form;

  return (
    <form
      onSubmit={handleSubmit(async (v) => onSubmit(v))}
      className="grid gap-4 md:grid-cols-2"
    >
      {/* N° Legajo */}
      <div className="space-y-1">
        <Label>Legajo</Label>
        <Input
          type="number"
          className="h-11 rounded border pr-3"
          {...register("employeeNumber", { valueAsNumber: true })}
        />
        {errors.employeeNumber && (
          <p className="text-xs text-red-600">{String(errors.employeeNumber.message)}</p>
        )}
      </div>

      {/* Tipo de documento */}
      <div className="space-y-1">
        <Label>Tipo de documento</Label>
        <Select
          value={watch("documentType") ?? ""}
          onValueChange={(val) => setValue("documentType", val, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full h-11 rounded border px-3 text-sm">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            {DOC_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.documentType && (
          <p className="text-xs text-red-600">{String(errors.documentType.message)}</p>
        )}
      </div>

      {/* Documento */}
      <div className="space-y-1">
        <Label>Número de documento</Label>
        <Input className="h-11 rounded border pr-3" {...register("documentNumber")} />
        {errors.documentNumber && (
          <p className="text-xs text-red-600">{String(errors.documentNumber.message)}</p>
        )}
      </div>

      {/* CUIL con máscara ##-########-# */}
      <div className="space-y-1">
        <Label>CUIL</Label>
        <Controller
          name="cuil"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <CuilInput
                className="h-11 rounded border pr-3"
                /* 👇 normalizo para que nunca sea null */
                value={field.value ?? ""}
                name={field.name}
                onBlur={field.onBlur}
                /* Mantengo el onChange estándar del RHF */
                onChange={field.onChange}
                /* Además, si tu CuilInput expone onValueChange con los 11 dígitos,
                   actualizo el valor del form con eso */
                onValueChange={(digits) => field.onChange(digits)}
              />
              {fieldState.error && (
                <p className="text-xs text-red-600">{String(fieldState.error.message)}</p>
              )}
            </>
          )}
        />
        
      </div>

      {/* Fechas */}
      <div className="space-y-1">
        <Label>Fecha de ingreso</Label>
        <Input type="date" className="h-11 rounded border pr-3" {...register("admissionDate")} />
        {errors.admissionDate && (
          <p className="text-xs text-red-600">{String(errors.admissionDate.message)}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Fecha de egreso</Label>
        <Input type="date" className="h-11 rounded border pr-3" {...register("terminationDate")} />
        {errors.terminationDate && (
          <p className="text-xs text-red-600">{String(errors.terminationDate.message)}</p>
        )}
      </div>

      {/* Estado */}
      <div className="space-y-1">
        <Label>Estado</Label>
        <Select
          value={watch("employmentStatus")}
          onValueChange={(val) => setValue("employmentStatus", val, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full h-11 rounded border px-3 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYMENT_STATUS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.employmentStatus && (
          <p className="text-xs text-red-600">{String(errors.employmentStatus.message)}</p>
        )}
      </div>

      {/* Tipo de contratación */}
      <div className="space-y-1">
        <Label>Tipo de contratación</Label>
        <Select
          value={watch("contractType") ?? ""}
          onValueChange={(val) => setValue("contractType", val, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full h-11 rounded border px-3 text-sm">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            {CONTRACT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.contractType && (
          <p className="text-xs text-red-600">{String(errors.contractType.message)}</p>
        )}
      </div>

      {/* Campos libres */}
      <div className="space-y-1">
        <Label>Cargo / Puesto</Label>
        <Input className="h-11 rounded border pr-3" {...register("position")} />
      </div>

      <div className="space-y-1">
        <Label>Área</Label>
        <Input className="h-11 rounded border pr-3" {...register("area")} />
      </div>

      <div className="space-y-1">
        <Label>Departamento</Label>
        <Input className="h-11 rounded border pr-3" {...register("department")} />
      </div>

      <div className="space-y-1">
        <Label>Categoría</Label>
        <Input className="h-11 rounded border pr-3" {...register("category")} />
      </div>

      <div className="md:col-span-2 space-y-1">
        <Label>Observaciones</Label>
        <Textarea rows={4} className="rounded border pr-3" {...register("notes")} />
      </div>

      <div className="md:col-span-2">
        <Button
          type="submit"
          className="w-full h-11 rounded bg-[#008C93] hover:bg-[#007381]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              {formatMessage("Guardando...")}
            </span>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </form>
  );
}
