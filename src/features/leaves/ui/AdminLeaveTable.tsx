"use client";

import { Badge } from "@/components/ui/badge";
import { PendingLeave } from "../hooks/usePendingApprovals";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
    items: any;
};


function truncate(text: string, max = 20) {
    if (text.length <= max) return text;
    return text.slice(0, max) + "…";
}

export function AdminLeaveTable({ items }: Props) {
    const rows: PendingLeave[] = Array.isArray(items)
        ? items
        : Array.isArray(items?.data)
            ? items.data
            : [];

    if (rows.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No hay solicitudes pendientes.
            </p>
        );
    }
    console.log("rows is array:", Array.isArray(rows), rows);
    return (
        <div className="rounded-md border">
            <table className="w-full text-sm">
                <thead className="bg-muted">
                    <tr>
                        <th className="px-3 py-2 text-left">Empleado</th>
                        <th className="px-3 py-2 text-left">Tipo</th>
                        <th className="px-3 py-2 text-left">Desde</th>
                        <th className="px-3 py-2 text-left">Hasta</th>
                        <th className="px-3 py-2 text-center">Días</th>
                        <th className="px-3 py-2 text-left">Observaciones</th>
                        <th className="px-3 py-2 text-left">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((l) => (
                        <tr key={l.id} className="border-t align-top">
                            <td className="px-3 py-2">
                                <div className="font-medium">
                                    {l.user.nombre} {l.user.apellido}
                                </div>
                                {l.user.legajo?.numeroLegajo && (
                                    <div className="text-xs text-muted-foreground">
                                        Legajo {l.user.legajo.numeroLegajo}
                                    </div>
                                )}
                            </td>
                            <td className="px-3 py-2">{l.type}</td>
                            <td className="px-3 py-2">{l.startYmd}</td>
                            <td className="px-3 py-2">{l.endYmd}</td>
                            <td className="px-3 py-2 text-center">{l.daysCount}</td>
                            <td className="px-3 py-2 max-w-[240px]">
                                {!l.note ? (
                                    <span className="text-muted-foreground">—</span>
                                ) : l.note.length <= 20 ? (
                                    l.note
                                ) : (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-pointer underline decoration-dotted">
                                                    {truncate(l.note, 20)}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-sm text-sm">
                                                {l.note}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </td>
                            <td className="px-3 py-2">
                                <Badge className="bg-yellow-100 text-yellow-800">
                                    PENDIENTE
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}