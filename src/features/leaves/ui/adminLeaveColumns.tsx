// adminLeaveColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { PendingLeave } from "../hooks/usePendingApprovals";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TableAction, TableActions } from "@/components/ui/table-actions";
import { ApproveLeaveDialog } from "./ApproveLeaveDialog";
import { RejectLeaveDialog } from "./RejectLeaveDialog";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { useState } from "react";
import { Check, Delete, SquareCheck, SquareCheckBig, SquareX, X } from "lucide-react";


export function adminLeaveColumns(
    onRefresh: () => void
): ColumnDef<PendingLeave>[] {
    return [
        {
            header: "Empleado",
            accessorKey: "user",
            cell: ({ row }) => {
                const u = row.original.user;
                return (
                    <div>
                        <div className="font-medium">
                            {u.nombre} {u.apellido}
                        </div>
                        {u.legajo?.numeroLegajo && (
                            <div className="text-xs text-muted-foreground">
                                Legajo {u.legajo.numeroLegajo}
                            </div>
                        )}
                    </div>
                );
            },
        },
        { accessorKey: "type", header: "Tipo" },
        { accessorKey: "startYmd", header: "Desde" },
        { accessorKey: "endYmd", header: "Hasta" },
        {
            accessorKey: "daysCount",
            header: "Días",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.daysCount}
                </div>
            ),
        },
        {
            accessorKey: "note",
            header: "Observaciones",
            cell: ({ row }) => {
                const note = row.original.note;

                if (!note) {
                    return <span className="text-muted-foreground">—</span>;
                }

                const short = note.length > 20 ? note.slice(0, 20) + "…" : note;

                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="cursor-help underline decoration-dotted">
                                    {short}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p className="text-sm">{note}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Estado",
            cell: () => (
                <Badge className="bg-yellow-100 text-yellow-800">
                    PENDIENTE
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const item = row.original;

                const ActionsCell = () => {
                    const [rejectOpen, setRejectOpen] = useState(false);
                    const [approveOpen, setApproveOpen] = useState(false);
                    const [loading, setLoading] = useState(false);

                    const actions: TableAction[] = [
                        {
                            label: "Aprobar",
                            icon: <SquareCheck className="w-4 h-4" />,
                            onClick: () => setApproveOpen(true),
                        },
                        {
                            label: "Rechazar",
                            icon: <SquareX className="w-4 h-4" />,
                            onClick: () => setRejectOpen(true),
                        },
                    ];

                    async function approve() {
                        try {
                            setLoading(true);
                            await axiosInstance.post(`/leaves/${item.id}/approve`);
                            toast.success("Solicitud aprobada");
                            onRefresh();
                            setApproveOpen(false);
                        } catch (err: any) {
                            toast.error(err.response?.data?.error ?? "Error al aprobar");
                        } finally {
                            setLoading(false);
                        }
                    }

                    async function reject(reason: string) {
                        try {
                            setLoading(true);
                            await axiosInstance.post(`/leaves/${item.id}/reject`, { reason });
                            toast.success("Solicitud rechazada");
                            onRefresh();
                            setRejectOpen(false);
                        } catch (err: any) {
                            toast.error(err.response?.data?.error ?? "Error al rechazar");
                        } finally {
                            setLoading(false);
                        }
                    }

                    return (
                        <>
                            <TableActions id={item.id} actions={actions} />

                            <ApproveLeaveDialog
                                open={approveOpen}
                                onOpenChange={setApproveOpen}
                                onConfirm={approve}
                                loading={loading}
                                item={item}
                            />

                            <RejectLeaveDialog
                                open={rejectOpen}
                                onOpenChange={setRejectOpen}
                                onConfirm={reject}
                                loading={loading}
                                item={item}
                            />
                        </>
                    );
                };

                return <ActionsCell />;
            },
        }
    ];
}
