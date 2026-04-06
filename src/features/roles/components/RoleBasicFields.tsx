"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  nombre: string;
  descripcion: string;
  onNombreChange: (value: string) => void;
  onDescripcionChange: (value: string) => void;
};

export function RoleBasicFields({
  nombre,
  descripcion,
  onNombreChange,
  onDescripcionChange,
}: Props) {
  return (
    <>
      <div className="space-y-2 max-w-xl">
        <Label>
          Nombre{" "}
          <p className="text-xs text-muted-foreground">
            ID único de rol.
          </p>
        </Label>
        <Input
          value={nombre}
          className="h-11 rounded border pr-10"
          onChange={(e) => onNombreChange(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-w-xl">
         <Label>
          Descripción
        </Label>
        <Input
          value={descripcion}
          className="h-11 rounded border pr-10"
          onChange={(e) => onDescripcionChange(e.target.value)}
        />
      </div>
    </>
  );
}