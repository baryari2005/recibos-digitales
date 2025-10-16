"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLogin } from "./useLogin";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { ErrorBannerInput } from "../components/ErrorBannerInput";
import { ForgotPasswordDialog } from "../ForgotPasswordDialog";
import { formatMessage } from "@/utils/formatters";
import { Logo } from "@/components/ui/logo";
import { LoginFields } from "./LoginFields";

export default function LoginForm() {
  const { form, onSubmit, topError, clearTopError, netSubmittingRef, triedMe, token, user } = useLogin();
  const { handleSubmit, formState } = form;
  const { isSubmitting, isValid } = formState;
  const router = useRouter();
  const sp = useSearchParams();
  const rawNext = sp.get("next");
  const next = useMemo(() => (rawNext && rawNext !== "/login" ? rawNext : "/"), [rawNext]);
  const lastReplaceRef = useRef<string | null>(null);

  useEffect(() => {
    if (triedMe && token && user) {
      const dest = next || "/";
      if (lastReplaceRef.current === dest) return;
      lastReplaceRef.current = dest;
      router.replace(dest);
    }
  }, [triedMe, token, user, next, router]);

  return (
    <div className="min-h-screen grid place-items-center bg-[#ebe9fb] p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl p-8 space-y-5">
        <Logo />
        {topError && <ErrorBannerInput message={topError} onClose={clearTopError} />}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <LoginFields form={form as any} errors={form.formState.errors} />

          <div className="mt-2 text-right">
            <ForgotPasswordDialog />
          </div>

          <Button type="submit" className="w-full h-11 rounded bg-[#008C93] hover:bg-[#007381]"
            disabled={isSubmitting || !isValid || netSubmittingRef.current}>
            {isSubmitting || netSubmittingRef.current ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                {formatMessage("Ingresando...")}
              </span>
            ) : ("Iniciar sesión")}
          </Button>
        </form>
      </div>
    </div>
  );
}
