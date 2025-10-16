"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/lib/api/password";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatMessage } from "@/utils/formatters";
import { PasswordField } from "./PasswordField";

type Props = { token: string };

export function ResetPasswordForm({ token }: Props) {
  const idPwd = useId();
  const idCfm = useId();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isValid, isDirty },
    reset,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    try {
      await resetPassword({ token, newPassword: values.password });
      toast.success("Contraseña cambiada correctamente. Iniciá sesión.");
      reset();
      window.location.href = "/login";
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo restablecer la contraseña (token inválido o vencido).";
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <PasswordField
        id={idPwd}
        label="Nueva contraseña"
        registration={register("password")}
        error={errors.password?.message}
        autoComplete="new-password"
      />

      <PasswordField
        id={idCfm}
        label="Confirmar contraseña"
        registration={register("confirm")}
        error={errors.confirm?.message}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        className="w-full h-11 rounded bg-[#008C93] hover:bg-[#007381] mt-4"
        disabled={isSubmitting || !isValid || !isDirty}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            {formatMessage("Guardando...")}
          </span>
        ) : (
          "Cambiar contraseña"
        )}
      </Button>

      <p className="text-xs text-muted-foreground">
        El enlace de restablecimiento puede expirar. Si falla, solicitá uno nuevo desde “¿Olvidó su contraseña?”.
      </p>
    </form>
  );
}
