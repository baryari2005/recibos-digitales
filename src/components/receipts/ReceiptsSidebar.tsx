"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocItem } from "./types";

export function ReceiptsSidebar({
  period, setPeriod, tab, setTab,
  loading, docs, selectedId, onBuscar, onSelect
}: {
  period: string;
  setPeriod: (v: string) => void;
  tab: "pendientes" | "firmados";
  setTab: (t: "pendientes" | "firmados") => void;
  loading: boolean;
  docs: DocItem[];
  selectedId: string | null;
  onBuscar: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="col-span-3 space-y-3">
      <Card>
        <CardContent className="p-3">
          <Tabs value={tab} onValueChange={v => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="pendientes" className="relative">
                Pendientes
                {docs.length > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1 text-xs text-primary">
                    {docs.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="firmados">Firmados</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-3 flex gap-2">
            <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="YYYY-MM" />
            <Button onClick={onBuscar} disabled={loading}>Buscar</Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">Mis Documentos</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading && <div className="p-4 text-sm text-muted-foreground">Cargando…</div>}
          {!loading && docs.length === 0 && <div className="p-4 text-sm text-muted-foreground">No hay documentos</div>}
          {!loading && docs.length > 0 && docs.map(d => (
            <button key={d.id}
              onClick={() => onSelect(d.id)}
              className={`w-full text-left p-4 border-l-4 transition-colors ${
                selectedId === d.id ? "border-teal-500 bg-muted/40" : "border-transparent hover:bg-muted/30"
              }`}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{d.title}</div>
                <Badge variant="outline" className="text-[11px]">{d.status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{d.period}</div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
