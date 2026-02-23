"use client";

import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useUsers } from "@/features/users/hooks/useUsers";
import { toast } from "sonner";
import Usuario from '@prisma/client';
import { CalendarCog, Loader2, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatMessage } from "@/utils/formatters";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
};

export function CreateVacationBalanceModal({
    open,
    onClose,
    onSaved,
}: Props) {
    const currentYear = new Date().getFullYear();

    const [userId, setUserId] = useState("");
    const [year, setYear] = useState(currentYear);
    const [totalDays, setTotalDays] = useState(14);
    const [loading, setLoading] = useState(false);
    const { users, isLoading } = useUsers();

    const token = localStorage.getItem("token");

    async function save() {
        try {
            setLoading(true);

            await axios.post("/api/admin/vacation-balance", {
                userId,
                year,
                totalDays,
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            onSaved();
            onClose();
        } catch (err: any) {
            const status = err?.response?.status;
            
            if (status === 400) {
                onClose();
                toast.warning("El período ya se encuentra cargado");
                return;
            }

            // otros errores
            alert("Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader className="px-5 pt-4 pb-2">
                    <DialogTitle className="text-sm-plus font-semibold flex">
                        <CalendarCog className="w-4 h-4 mr-2" />
                        Asignar Saldo</DialogTitle>
                    <Separator className="mt-4 mb-4" />
                    <DialogDescription className="text-sm-plus  justify-center">
                        Asignar saldo de vacaciones por usuario
                    </DialogDescription>
                </DialogHeader>


                <div className="grid gap-3 px-5 pb-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm">Empleado</Label>

                        <Select
                            value={userId}
                            onValueChange={(v) => setUserId(v)}
                        >
                            <SelectTrigger className="h-11 rounded border pr-3 w-full">
                                <SelectValue placeholder="Seleccionar empleado" />
                            </SelectTrigger>

                            <SelectContent>
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.apellido}, {u.nombre}
                                        {u.legajo?.numeroLegajo
                                            ? ` (Legajo ${u.legajo.numeroLegajo})`
                                            : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm">Año</Label>
                        <Input
                            type="number"
                            className="h-11 pr-4 rounded"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-sm">Días asignados</Label>
                        <Input
                            type="number"
                            className="h-11 pr-4 rounded"
                            value={totalDays}
                            onChange={(e) => setTotalDays(Number(e.target.value))}
                        />
                    </div>
                </div>

                <DialogFooter className="px-5 py-3 bg-muted/40 border-t rounded-none">
                    <DialogClose asChild>
                        <Button className="h-11 rounded" variant="outline" onClick={onClose}>Cancelar</Button>
                    </DialogClose>
                    <Button onClick={save}
                        disabled={loading || !userId}
                        className="h-11 rounded  bg-[#008C93] hover:bg-[#007381] cursor-pointer" >
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="animate-spin" size={18} />
                                {formatMessage("Guardando...")}
                            </span>
                        ) : (
                           <span className="inline-flex items-center gap-2"><Save className="w-4 h-4"/>Guardar</span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
