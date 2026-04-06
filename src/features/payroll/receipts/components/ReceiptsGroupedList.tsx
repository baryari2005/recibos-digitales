"use client";

import { IdCard, LinkIcon, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiGroup } from "../types/types";
import { ReceiptStatusBadge } from "./ReceiptStatusBadge";
import { LoadingInTable } from "@/components/feedback/CenteredSpinner";

type Props = {
  groups: ApiGroup[];
  loading: boolean;
  openCuil: Record<string, boolean>;
  onToggleGroup: (cuil: string) => void;
};

export function ReceiptsGroupedList({
  groups,
  loading,
  openCuil,
  onToggleGroup,
}: Props) {
  return (
    <div className="rounded border">
      {loading ? (
        <LoadingInTable/>
      ) : groups.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">Sin resultados</div>
      ) : (
        <div className="divide-y">
          {groups.map((g) => {
            const key = g.cuil;
            const isOpen = openCuil[key] ?? true;
            const fullName =
              [g.user?.apellido ?? "", g.user?.nombre ?? ""].join(" ").trim() ||
              "(sin nombre)";

            return (
              <div key={key}>
                <button
                  type="button"
                  className={cn(
                    "w-full text-left px-4 py-3 bg-muted/40 hover:bg-muted/60 flex items-center justify-between"
                  )}
                  onClick={() => onToggleGroup(key)}
                >
                  <div className="font-medium">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {fullName}
                      <IdCard className="w-4 h-4 ml-6" />
                      {g.cuil}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {g.receipts.length} documento
                    {g.receipts.length === 1 ? "" : "s"}
                  </div>
                </button>

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
                            <td className="p-2">
                              <ReceiptStatusBadge status={r.status} />
                            </td>
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
  );
}