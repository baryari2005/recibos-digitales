"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PermisosGrupo, RoleUpdate } from "../types/types";
import { RoleBasicFields } from "./RoleBasicFields";
import { RoleStatusField } from "./RoleStatusField";
import { RolePermissionsSection } from "./RolePermissionsSection";
import { RoleFormActions } from "./RoleFormActions";
import { ShieldUser } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type Props = {
    id: string;
    role: RoleUpdate | null;
    permisos: PermisosGrupo[];
    selectedPermisos: number[];
    loading: boolean;
    saving: boolean;
    nombre: string;
    descripcion: string;
    activo: boolean;
    setNombre: (value: string) => void;
    setDescripcion: (value: string) => void;
    setActivo: (value: boolean) => void;
    togglePermiso: (permisoId: number) => void;
    handleSave: () => Promise<void>;
    handleCancel: () => void;
};

export function EditRoleForm({
    permisos,
    selectedPermisos,
    saving,
    nombre,
    descripcion,
    activo,
    setNombre,
    setDescripcion,
    setActivo,
    togglePermiso,
    handleSave,
    handleCancel,
}: Props) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                        <ShieldUser className="mr-2" />
                        Editar Rol
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <RoleBasicFields
                        nombre={nombre}
                        descripcion={descripcion}
                        onNombreChange={setNombre}
                        onDescripcionChange={setDescripcion}
                    />

                    <RoleStatusField
                        activo={activo}
                        onActivoChange={setActivo}
                    />

                    <Separator />
                    
                    <RolePermissionsSection
                        permisos={permisos}
                        selectedPermisos={selectedPermisos}
                        onTogglePermiso={togglePermiso}
                    />

                    <RoleFormActions
                        saving={saving}
                        onCancel={handleCancel}
                        onSave={handleSave}
                    />
                </CardContent>
            </Card>
        </div>
    );
}