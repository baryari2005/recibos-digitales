"use client";

import { BrushCleaning, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReceiptFilterStatus } from "../types/types";

type Props = {
  q: string;
  setQ: (value: string) => void;
  status: ReceiptFilterStatus;
  setStatus: (value: ReceiptFilterStatus) => void;
  from: string;
  setFrom: (value: string) => void;
  to: string;
  setTo: (value: string) => void;
  loading: boolean;
  onApply: () => void;
  onClear: () => void;
};

export function ReceiptsFilters({
  q,
  setQ,
  status,
  setStatus,
  from,
  setFrom,
  to,
  setTo,
  loading,
  onApply,
  onClear,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-2">
          <Label className="mb-2">Búsqueda</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="CUIL, nombre, apellido, email, userId…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-11 rounded border pr-3 pl-9"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2">
            Desde
            <p className="text-xs text-muted-foreground">(mes)</p>
          </Label>
          <Input
            type="month"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-11 rounded border pr-3"
          />
        </div>

        <div>
          <Label className="mb-2">
            Hasta
            <p className="text-xs text-muted-foreground">(mes)</p>
          </Label>
          <Input
            type="month"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-11 rounded border pr-3"
          />
        </div>

        <div>
          <Label className="mb-2">Estado</Label>
          <Select
            value={status}
            onValueChange={(v: ReceiptFilterStatus) => setStatus(v)}
          >
            <SelectTrigger className="h-11 rounded border pr-3 w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="signed">Firmado</SelectItem>
              <SelectItem value="disagreement">Disconformidad</SelectItem>
              <SelectItem value="unsigned">Pendiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          onClick={onApply}
          disabled={loading}
          className="h-11 rounded bg-[#008C93] hover:bg-[#007381]"
        >
          <Filter className="w-4 h-4 mr-2" />
          Aplicar filtros
        </Button>

        <Button
          variant="outline"
          onClick={onClear}
          disabled={loading}
          className="h-11 rounded"
        >
          <BrushCleaning className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
      </div>
    </div>
  );
}