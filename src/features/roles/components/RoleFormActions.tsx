"use client";

import { Button } from "@/components/ui/button";
import { formatMessage } from "@/utils/formatters";
import { Loader2, Save } from "lucide-react";

type Props = {
    saving: boolean;
    onCancel: () => void;
    onSave: () => void | Promise<void>;
};

export function RoleFormActions({ saving, onCancel, onSave }: Props) {
    return (
        <div className="flex justify-end gap-3">
            <Button className="h-11 rounded" variant="outline" onClick={onCancel}>
                Cancelar
            </Button>

            <Button onClick={onSave} disabled={saving} className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer">
                {saving ? (
                    <span className="inline-flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        {formatMessage("Guardando...")}
                    </span>
                )
                    :
                    (
                        <span className="inline-flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Guardar cambios
                        </span>
                    )
                }
            </Button>
        </div>
    );
}