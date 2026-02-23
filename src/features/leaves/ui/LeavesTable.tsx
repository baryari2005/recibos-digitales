"use client";

import { LeaveItem } from "../hooks/useLeaves";
import { Badge } from "@/components/ui/badge";

type Props = {
  items: LeaveItem[];
};

export function LeavesTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tenés solicitudes de vacaciones.
      </p>
    );
  }

  return (
    <div className="rounded-md border mt-2">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-3 py-2 text-left">Tipo</th>
            <th className="px-3 py-2 text-left">Desde</th>
            <th className="px-3 py-2 text-left">Hasta</th>
            <th className="px-3 py-2 text-center">Días</th>
            <th className="px-3 py-2 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="px-3 py-2">{l.type}</td>
              <td className="px-3 py-2">{l.startYmd}</td>
              <td className="px-3 py-2">{l.endYmd}</td>
              <td className="px-3 py-2 text-center">{l.daysCount}</td>
              <td className="px-3 py-2">
                <Badge variant="outline">{l.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
