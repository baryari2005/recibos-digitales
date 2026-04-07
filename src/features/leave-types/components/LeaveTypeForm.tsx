"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarCog, Loader2, Save } from "lucide-react";

type Props = {
  title: string;
  submitLabel: string;
  code: string;
  label: string;
  colorHex: string;
  isActive: boolean;
  loading: boolean;
  error: string | null;
  onCodeChange: (value: string) => void;
  onLabelChange: (value: string) => void;
  onColorHexChange: (value: string) => void;
  onIsActiveChange: (value: boolean) => void;
  onSubmit: () => void | Promise<void>;
  onCancel: () => void;
};

export function LeaveTypeForm({
  title,
  submitLabel,
  code,
  label,
  colorHex,
  isActive,
  loading,
  error,
  onCodeChange,
  onLabelChange,
  onColorHexChange,
  onIsActiveChange,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <CalendarCog className="mr-2" />
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="max-w-xl space-y-6">
          <div className="space-y-2">
            <Label htmlFor="leave-type-code">Código</Label>
            <Input
              id="leave-type-code"
              value={code}
              onChange={(event) => onCodeChange(event.target.value)}
              placeholder="Ej: VACACIONES"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-type-label">Etiqueta</Label>
            <Input
              id="leave-type-label"
              value={label}
              onChange={(event) => onLabelChange(event.target.value)}
              placeholder="Ej: Vacaciones"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-type-color">Color HEX</Label>
            <Input
              id="leave-type-color"
              value={colorHex}
              onChange={(event) => onColorHexChange(event.target.value)}
              placeholder="Ej: #22c55e"
            />
          </div>

          <div className="flex items-center justify-between rounded border p-4">
            <div>
              <p className="text-sm font-medium">Tipo activo</p>
              <p className="text-xs text-muted-foreground">
                Si está inactivo no se ofrecerá para nuevas solicitudes.
              </p>
            </div>

            <Switch
              checked={isActive}
              onCheckedChange={onIsActiveChange}
            />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" className="h-11 rounded" onClick={onCancel}>
              Cancelar
            </Button>

            <Button
              onClick={onSubmit}
              disabled={loading}
              className="h-11 rounded bg-[#008C93] cursor-pointer hover:bg-[#007381]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Guardando...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {submitLabel}
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
