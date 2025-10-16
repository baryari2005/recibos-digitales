// components/account/ChangePasswordDialog.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { changePassword } from "@/lib/api/account";
import { Eye, EyeOff, KeyRoundIcon, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatMessage } from "@/utils/formatters";
import { useAuth } from "@/stores/auth";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function ChangePasswordDialog({ open, onOpenChange }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { logout } = useAuth();

  const canSave = useMemo(() => {
    return (
      values.currentPassword.length > 0 &&
      values.newPassword.length >= 6 &&
      values.newPassword === values.confirm &&
      !submitting
    );
  }, [values, submitting]);

  const onSubmit = async () => {
    if (!canSave) return;

    setSubmitting(true);
    try {
      const res = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      console.log("[RES]:", res);
      toast.success("Contraseña actualizada. Se iniciara nuevamente la sesión.");
      onOpenChange(false);                    // 👈 cierra el modal
      setTimeout(() => logout(), 1500); 
    } catch (e: any) {
      console.log("[RES]:", e.response.data.message);
      const msg = e?.response?.data?.message ?? "Error al actualizar la contraseña.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // cuadrado, header y footer bien definidos
        className="sm:max-w-md rounded-sm p-0"
      >
        {/* HEADER */}
        <DialogHeader className="px-5 pt-4 pb-2">
          <DialogTitle className="text-sm-plus font-semibold flex"><KeyRoundIcon className="w-4 h-4 mr-2"/>Editar clave</DialogTitle>
          <Separator className="mt-4 mb-4"/>
          <DialogDescription className="text-sm-plus  justify-center">
            Cambia tu clave de acceso
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="grid gap-3 px-5 pb-4">
          <PasswordField
            label="Ingrese clave actual"
            placeholder="Ingrese clave actual"
            value={values.currentPassword}
            onChange={(v) => setValues((s) => ({ ...s, currentPassword: v }))}
            visible={show.current}
            onToggleVisible={() => setShow((s) => ({ ...s, current: !s.current }))}
          />

          <PasswordField
            label="Ingrese nueva clave"
            placeholder="Ingrese nueva clave"
            value={values.newPassword}
            onChange={(v) => setValues((s) => ({ ...s, newPassword: v }))}
            visible={show.new}
            onToggleVisible={() => setShow((s) => ({ ...s, new: !s.new }))}
          />

          <PasswordField
            label="Repita nueva clave"
            placeholder="Repita nueva clave"
            value={values.confirm}
            onChange={(v) => setValues((s) => ({ ...s, confirm: v }))}
            visible={show.confirm}
            onToggleVisible={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
          />
        </div>

        {/* FOOTER (gris con borde arriba) */}
        <DialogFooter className="px-5 py-3 bg-muted/40 border-t rounded-none">
          <DialogClose asChild>
            <Button className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer" >Cancelar</Button>
          </DialogClose>
          <Button onClick={onSubmit} 
          disabled={!canSave} 
          className="h-11 rounded  bg-[#008C93] hover:bg-[#007381] cursor-pointer" >
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

/** Campo reutilizable con botón “ojo” a la derecha */
function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggleVisible,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="sr-only">{label}</Label>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10 h-11 rounded-none mt-2"
          onKeyDown={(e) => {
            // permitir Enter para enviar
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
        />
        <button
          type="button"
          aria-label={visible ? "Ocultar clave" : "Mostrar clave"}
          onClick={onToggleVisible}
          className="absolute inset-y-0 right-2 my-auto h-8 w-8 grid place-items-center rounded hover:bg-muted/60"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
