// src/components/import-users/ExcelHeadersDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ExcelHeadersDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Encabezados esperados del Excel</DialogTitle>
          <DialogDescription>
            Usá estos nombres de columna para que el import haga el mapeo
            automático. Si alguno no está, se toma como <code>null</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          <div className="space-y-1">
            <p><code>userId</code></p>
            <p><code>tipoDocumento</code></p>
            <p><code>documento</code></p>
            <p><code>cuil</code></p>
            <p><code>email</code></p>
            <p><code>nombre</code></p>
            <p><code>apellido</code></p>
            <p><code>fechaNacimiento</code></p>
            <p><code>celular</code></p>
            <p><code>domicilio</code></p>
            <p><code>codigoPostal</code></p>
            <p><code>estadoCivil</code></p>
            <p><code>nacionalidad</code></p>
          </div>
          <div className="space-y-1">
            <p><code>numeroLegajo</code></p>
            <p><code>genero</code></p>
            <p><code>matriculaProvincial</code></p>
            <p><code>matriculaNacional</code></p>
            <p><code>fechaIngreso</code></p>
            <p><code>fechaEgreso</code></p>
            <p><code>estadoLaboral</code></p>
            <p><code>tipoContrato</code></p>
            <p><code>puesto</code></p>
            <p><code>area</code></p>
            <p><code>departamento</code></p>
            <p><code>categoria</code></p>
            <p><code>observaciones</code></p>

          </div>
        </div>

        {/* <div className="mt-3">
          <p className="text-xs text-muted-foreground">
            También podés agregar:{" "}
            <code>genero</code>, <code>matriculaProvincial</code>,{" "}
            <code>matriculaNacional</code>, <code>estadoLaboral</code>,{" "}
            <code>tipoContrato</code>, <code>puesto</code>, <code>area</code>,{" "}
            <code>departamento</code>, <code>categoria</code>,{" "}
            <code>observaciones</code>.
          </p>
        </div> */}

        <DialogFooter className="mt-4">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-[#008C93] rounded hover:bg-[#007381]"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
