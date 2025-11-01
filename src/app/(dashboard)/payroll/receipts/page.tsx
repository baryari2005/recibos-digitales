// src/app/(dashboard)/payroll/receipts-admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileText, Filter, LinkIcon, Users, CheckCircle2, AlertTriangle, Clock, FileSearch2, BrushCleaning, User, Dock, IdCard, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/lib/axios"; // 👈 usamos axios, que ya trae cookies/headers

// opcional: <RoleGate allowIds={[1]} mode="render">...</RoleGate>

type ApiGroup = {
  cuil: string;
  user: {
    id: string;
    userId: string | null;
    email: string;
    nombre: string | null;
    apellido: string | null;
    cuil: string | null;
  } | null;
  receipts: {
    id: string;
    period: string;
    periodDate: string;
    fileUrl: string;
    filePath: string;
    signed: boolean;
    signedDisagreement: boolean;
    observations: string | null;
    createdAt: string;
    updatedAt: string;
    status: "FIRMADO" | "DISCONFORMIDAD" | "PENDIENTE";
  }[];
};

type ApiResponse = {
  summary: { totals: number; signed: number; disagreement: number; unsigned: number; coverage: string };
  groups: ApiGroup[];
};

function statusBadge(s: "FIRMADO" | "DISCONFORMIDAD" | "PENDIENTE") {
  if (s === "FIRMADO") return <Badge className="bg-emerald-600 hover:bg-emerald-600">Firmado</Badge>;
  if (s === "DISCONFORMIDAD") return <Badge className="bg-amber-600 hover:bg-amber-600">Disconformidad</Badge>;
  return <Badge className="bg-slate-500 hover:bg-slate-500">Pendiente</Badge>;
}

export default function PayrollReceiptsAdminPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "signed" | "unsigned" | "disagreement">("all");
  const [from, setFrom] = useState<string>(""); // YYYY-MM
  const [to, setTo] = useState<string>("");     // YYYY-MM
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [openCuil, setOpenCuil] = useState<Record<string, boolean>>({}); // colapsar/expandir

  // Solo para mostrar qué se va a pedir (no lo uso para fetch, armamos params abajo)
  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (status !== "all") p.set("status", status);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    return p.toString();
  }, [q, status, from, to]);

  async function fetchData() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (q.trim()) params.q = q.trim();
      if (status !== "all") params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;

      // 👇 Usa axiosInstance para que viaje la cookie/Authorization
      const { data } = await axiosInstance.get<ApiResponse>("/payroll/receipts/all", {
        params,
        // Si tu axios no tiene withCredentials global:
        withCredentials: true,
      });

      setData(data);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message ?? e?.message ?? "No se pudieron cargar los recibos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters() {
    fetchData();
  }

  return (
    <div className="grid gap-6 space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center">
            <FileSearch2 className="w-6 h-6 mr-2" />
            Seguimiento de Recibos Digitales
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Filtros */}
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
                <Label className="mb-2">Desde<p className="text-xs text-muted-foreground"> (mes)</p></Label>
                <Input type="month" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 rounded border pr-3" />
              </div>
              <div>
                <Label className="mb-2">Hasta<p className="text-xs text-muted-foreground"> (mes)</p></Label>
                <Input type="month" value={to} onChange={(e) => setTo(e.target.value)} className="h-11 rounded border pr-3" />
              </div>
              <div>
                <Label className="mb-2">Estado</Label>
                <Select value={status} onValueChange={(v: "all" | "signed" | "unsigned" | "disagreement") => setStatus(v)} >
                  <SelectTrigger className="h-11 rounded border pr-3 w-full">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent >
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="signed">Firmado</SelectItem>
                    <SelectItem value="disagreement">Disconformidad</SelectItem>
                    <SelectItem value="unsigned">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Button onClick={applyFilters} disabled={loading} className="h-11 rounded bg-[#008C93] hover:bg-[#007381]">
                <Filter className="w-4 h-4 mr-2" />
                Aplicar filtros
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setQ(""); setFrom(""); setTo(""); setStatus("all");
                  setTimeout(fetchData, 0);
                }}
                disabled={loading}
                className="h-11 rounded"
              >
                <BrushCleaning className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>

          {/* Stats */}
          {data && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded border p-4">
                  <div className="text-xs text-muted-foreground">Total documentos</div>
                  <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                    <Users className="h-5 w-5" /> {data.summary.totals}
                  </div>
                </div>
                <div className="rounded border p-4">
                  <div className="text-xs text-muted-foreground">Firmados</div>
                  <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                    <CheckCircle2 className="h-5 w-5" /> {data.summary.signed}
                  </div>
                </div>
                <div className="rounded border p-4">
                  <div className="text-xs text-muted-foreground">Disconformidad</div>
                  <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                    <AlertTriangle className="h-5 w-5" /> {data.summary.disagreement}
                  </div>
                </div>
                <div className="rounded border p-4">
                  <div className="text-xs text-muted-foreground">Cobertura</div>
                  <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
                    <Clock className="h-5 w-5" /> {data.summary.coverage}%
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Lista agrupada */}
          <div className="rounded border">
            {!data || loading ? (
              <div className="p-6 text-sm text-muted-foreground">Cargando…</div>
            ) : data.groups.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">Sin resultados</div>
            ) : (
              <div className="divide-y">
                {data.groups.map((g) => {
                  const key = g.cuil;
                  const isOpen = openCuil[key] ?? true;
                  const fullName = [g.user?.apellido ?? "", g.user?.nombre ?? ""].join(" ").trim() || "(sin nombre)";
                  const header = (
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {fullName} <IdCard className="w-4 h-4 ml-6" /> {g.cuil}
                    </span>
                  );
                  return (
                    <div key={key}>
                      {/* Encabezado por usuario */}
                      <button
                        type="button"
                        className={cn(
                          "w-full text-left px-4 py-3 bg-muted/40 hover:bg-muted/60 flex items-center justify-between"
                        )}
                        onClick={() => setOpenCuil((s) => ({ ...s, [key]: !isOpen }))}
                      >
                        <div className="font-medium">{header}</div>
                        <div className="text-xs text-muted-foreground">
                          {g.receipts.length} documento{g.receipts.length === 1 ? "" : "s"}
                        </div>
                      </button>

                      {/* Tabla del grupo */}
                      {isOpen && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="p-2 text-left">Período</th>
                                <th className="p-2 text-left">Estado</th>
                                <th className="p-2 text-left">Observaciones</th>
                                <th className="p-2 text-left">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {g.receipts.map((r) => (
                                <tr key={r.id} className="border-t">
                                  <td className="p-2">{r.period}</td>
                                  <td className="p-2">{statusBadge(r.status)}</td>
                                  <td className="p-2">{r.observations ?? "-"}</td>
                                  <td className="p-2">
                                    <a
                                      href={r.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-[#008C93] hover:underline"
                                    >
                                      <LinkIcon className="h-4 w-4 mr-1" />
                                      Ver PDF
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
