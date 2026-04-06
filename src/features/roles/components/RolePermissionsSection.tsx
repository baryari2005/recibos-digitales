"use client";

import { Label } from "@/components/ui/label";
import type { PermisosGrupo } from "../types/types";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PermissionIcon } from "./PermissionIcon";

type Props = {
    permisos: PermisosGrupo[];
    selectedPermisos: number[];
    onTogglePermiso: (permisoId: number) => void;
};

export function RolePermissionsSection({
    permisos,
    selectedPermisos,
    onTogglePermiso,
}: Props) {
    return (
        <div className="space-y-6">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                    <Wrench className="mr-2" />
                    Editar Permisos
                </CardTitle>
            </CardHeader>
            <CardContent>
                {permisos.map((grupo) => (
                    <div key={grupo.modulo} className="border pt-2 pb-2 mb-2 rounded-lg p-4">
                        <Label className="text-xl pb-2">
                            {grupo.modulo}
                        </Label>

                        <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                            {grupo.permisos.map((permiso) => {
                                const checked = selectedPermisos.includes(permiso.id);

                                return (

                                    <div
                                        key={permiso.id}
                                        className="flex items-center justify-between rounded p-2 gap-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                <PermissionIcon name={permiso.icono} />
                                            </div>

                                            <div className="flex flex-col">
                                                <Label
                                                    htmlFor={`permiso-${permiso.id}`}
                                                    className="text-sm font-medium cursor-pointer"
                                                >
                                                    {permiso.accion}
                                                </Label>

                                                {permiso.descripcion ? (
                                                    <span className="text-sm text-muted-foreground">
                                                        {permiso.descripcion}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        <Switch
                                            id={`permiso-${permiso.id}`}
                                            checked={checked}
                                            onCheckedChange={() => onTogglePermiso(permiso.id)}
                                        />
                                    </div>

                                );
                            })}
                        </div>
                    </div>
                ))}
            </CardContent>
        </div>
    );
}