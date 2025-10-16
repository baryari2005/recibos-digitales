"use client";

import { useState, useId, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas";
import { requestPasswordReset } from "@/features/auth/api";
import { Loader2, Mail } from "lucide-react";
import { IconInput } from "../inputs/IconInput";
import { formatMessage } from "@/utils/formatters";

type ForgotPasswordDialogProps = {
  /** Texto del trigger (link/botón) */
  triggerText?: string;
  /** Callback opcional cuando se envía correctamente */
  onSent?: () => void;
  /** Si preferís forzar estado abierto/ cerrado desde afuera */
  openControlled?: boolean;
  onOpenChangeControlled?: (open: boolean) => void;
};

export function ForgotPasswordDialog(props: ForgotPasswordDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [openUncontrolled, setOpenUncontrolled] = useState(false);
  useEffect(() => setMounted(true), []);
  const emailId = useId();

  
  const { triggerText = "¿Olvidó su contraseña?", onSent, openControlled, onOpenChangeControlled } = props;
  
  const open = openControlled ?? openUncontrolled;
  const setOpen = onOpenChangeControlled ?? setOpenUncontrolled;
  
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid, isDirty },
    reset,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });
  
  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await requestPasswordReset(values.email);
      toast.success("Si el email existe, te enviamos un enlace para restablecer la contraseña.");
      reset();
      setOpen(false);
      onSent?.();
    } catch (err: any) {
      // Mensaje uniforme para no filtrar info; solo log interno
      console.error("forgot-password error:", err?.response?.status, err?.response?.data || err?.message);
      toast.error("No se pudo procesar la solicitud. Intentá nuevamente en unos minutos.");
    }
  };
  
  if (!mounted) return null; 

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-sm text-indigo-700 hover:underline">{triggerText}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label htmlFor={emailId} className="text-sm text-muted-foreground">
              Email
            </label>
            <IconInput
              id={emailId}
              leftIcon={<Mail className="h-4 w-4 text-muted-foreground" />}
              input={
                <Input id={emailId}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tu@correo.com"
                  {...register("email")} aria-invalid={!!errors.email} className="h-11 rounded border pl-9 pr-10" />
              }
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded bg-[#008C93] hover:bg-[#007381]"
            disabled={isSubmitting || !isValid || !isDirty}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                {formatMessage("Enviando...")}
              </span>
            ) : ("Enviar enlace")}
          </Button>

          <p className="text-xs text-muted-foreground">
            Te enviaremos un enlace si tu email está registrado. Por seguridad, el mensaje es el mismo
            independientemente de si el email existe o no.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
