"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { ErrorBannerInput } from "../ErrorBannerInput";
import { ForgotPasswordDialog } from "../ForgotPasswordDialog";
import { formatMessage } from "@/utils/formatters";
import { Logo } from "@/components/ui/logo";
import { LoginFields } from "./LoginFields";
import { useLogin } from "../../hooks/useLogin";

type Props = {
  nextParam?: string;
};

export default function LoginForm({ nextParam }: Props) {
  const {
    form,
    onSubmit,
    topError,
    dismissTopError,
    netSubmittingRef,
    triedMe,
    token,
    user,
  } = useLogin();

  const { handleSubmit, formState } = form;
  const { isSubmitting } = formState;
  const router = useRouter();

  const next = useMemo(
    () => (nextParam && nextParam !== "/login" ? nextParam : "/"),
    [nextParam]
  );

  const lastReplaceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!triedMe || !token || !user) {
      return;
    }

    const destination = next || "/";

    if (lastReplaceRef.current === destination) {
      return;
    }

    lastReplaceRef.current = destination;
    router.replace(destination);
  }, [triedMe, token, user, next, router]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#ebe9fb] p-4">
      <div className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-xl">
        <Logo />

        {topError && (
          <ErrorBannerInput
            message={topError}
            onClose={dismissTopError}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <LoginFields form={form} />

          <div className="mt-2 text-right">
            <ForgotPasswordDialog />
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded bg-[#008C93] hover:bg-[#007381]"
            disabled={isSubmitting || netSubmittingRef.current}
          >
            {isSubmitting || netSubmittingRef.current ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                {formatMessage("Ingresando...")}
              </span>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}