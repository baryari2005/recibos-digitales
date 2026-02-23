"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

type ConfirmDialogProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    icon?: React.ReactNode;
    onConfirm: () => Promise<void> | void;
    onClose: () => void;
};

export function ConfirmDialog({
    open,
    title = "¿Estás seguro?",
    description = "Esta acción no se puede deshacer.",
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    loading,
    icon,
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                {/* HEADER */}
                <DialogHeader className="px-5 pt-4 ">
                    <DialogTitle className="text-sm-plus font-semibold flex">                        
                        {title}
                    </DialogTitle>
                    <Separator className="mt-4 mb-4" />
                    <DialogDescription className="text-sm-plus  justify-center">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                {/* FOOTER */}
                {/* <DialogFooter className="px-5 py-3 bg-muted/40 border-t rounded-none"> */}
                <DialogFooter className="px-5 py-3 border-t rounded-none bg-background">
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            className="h-11 rounded"
                            disabled={loading}
                        >
                            {cancelLabel}
                        </Button>
                    </DialogClose>

                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className="h-11 rounded bg-[#008C93] hover:bg-[#007381]"
                    >
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="animate-spin" size={16} />
                                Procesando...
                            </span>
                        ) : (
                            icon && <span className="inline-flex items-center gap-2">{icon} {confirmLabel}</span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
