// components/account/ChangeEmailDialog.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { changeEmail } from "@/lib/api/account";
import { useAuth } from "@/stores/auth";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { formatMessage } from "@/utils/formatters";

type Props = { open: boolean; onOpenChange: (v: boolean) => void; currentEmail: string; };

export function ChangeEmailDialog({ open, onOpenChange, currentEmail }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const { logout } = useAuth();

  // validación de email sencilla
  const emailError = useMemo(() => {
    if (!values.email) return "El email no es válido";
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);
    return ok ? "" : "El email no es válido";
  }, [values.email]);

  const canSave = useMemo(() => {
    return !submitting && !emailError && values.password.length >= 6;
  }, [submitting, emailError, values.password]);

  const onSubmit = async () => {
    if (!canSave) return;
    setSubmitting(true);
    try {
      await changeEmail({ email: values.email.trim(), password: values.password });
      toast.success("Email actualizado. Se iniciara nuevamente la sesión.");
      onOpenChange(false);
      setTimeout(() => logout(), 1500); 
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "No se pudo actualizar email.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-sm p-0">
        {/* HEADER */}
        <DialogHeader className="px-5 pt-4 pb-2">
          <DialogTitle className="text-sm-plus font-semibold flex">
            <Mail className="w-4 h-4 mr-2"/>Editar email</DialogTitle>
          <Separator className="mt-4 mb-4"/>
          <DialogDescription className="text-sm-plus  justify-center">
            Cambia tu email personal
          </DialogDescription>

          {/* Email actual con icono */}
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>
              Tu correo electrónico actual asociado es{" "}
              <span className="font-medium text-foreground">{currentEmail}</span>
            </span>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="grid gap-3 px-5 pb-4">
          {/* Nuevo email */}
          <div className="space-y-1.5">
            <Label className="text-sm">Correo electrónico nuevo</Label>
            <Input
              type="email"
              placeholder="Ingresa tu nuevo email"
              value={values.email}
              onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
              className={`h-11 rounded ${emailError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            {emailError ? (
              <p className="text-xs text-red-600">El email no es válido</p>
            ) : null}
          </div>

          {/* Clave actual con ojito */}
          <div className="space-y-1.5">
            <Label className="text-sm">Clave actual</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Ingresa tu clave actual"
                value={values.password}
                onChange={(e) => setValues((s) => ({ ...s, password: e.target.value }))}
                className="h-11 pr-10 rounded"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmit();
                }}
              />
              <button
                type="button"
                aria-label={showPw ? "Ocultar clave" : "Mostrar clave"}
                onClick={() => setShowPw((v) => !v)}
                className="absolute inset-y-0 right-2 my-auto h-8 w-8 grid place-items-center rounded hover:bg-muted/60"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>           
        </div>

        {/* FOOTER gris con botones */}
        <DialogFooter className="px-5 py-3 bg-muted/40 border-t rounded-none">
          <DialogClose asChild>
            <Button className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer">
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={onSubmit}
            disabled={!canSave}
           className="h-11 rounded  bg-[#008C93] hover:bg-[#007381] cursor-pointer">
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                {formatMessage("Guardando...")}
              </span>
            ) : ("Guardar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

