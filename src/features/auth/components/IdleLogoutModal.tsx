"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  seconds: number;
  onContinue: () => void;
  onLogout: () => void;
};

export function IdleLogoutModal({
  open,
  seconds,
  onContinue,
  onLogout,
}: Props) {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm text-center">
        {/* ✅ REQUIRED for Radix accessibility */}
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Tu tiempo está por terminar
          </DialogTitle>
        </DialogHeader>

        <p className="mt-4">Tu sesión se cerrará en:</p>

        <div className="text-5xl font-bold my-4">{seconds}</div>

        <div className="flex justify-between mt-6">
          <Button onClick={onLogout} className="w-40 h-11 rounded bg-[#008C93] hover:bg-[#007381]">
            Cerrar sesión
          </Button>
          <Button onClick={onContinue} className="w-40 h-11 rounded bg-[#008C93] hover:bg-[#007381]">Continuar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
