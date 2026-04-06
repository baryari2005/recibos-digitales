"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
    activo: boolean;
    onActivoChange: (value: boolean) => void;
};

export function RoleStatusField({ activo, onActivoChange }: Props) {
    return (
        <div className="flex items-center justify-between border rounded p-4 max-w-xl">
            <div>
                <Label>
                    Rol activo
                </Label>
            </div>

            <Switch
                checked={activo}
                onCheckedChange={onActivoChange}
            />
        </div>
    );
}