"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

type Props = { children: React.ReactNode };

/**
 * Si el usuario tiene mustChangePassword = true, bloquea el render
 * y redirige a /account/change-password preservando la ruta actual en ?next=
 */
export function MustChangePasswordGate({ children }: Props) {
  const { user,  loading: isLoading } = useCurrentUser(); // asumimos { user?, isLoading? }
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const here =
    pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

  useEffect(() => {
    if (isLoading) return;
    // Si no hay user, lo maneja <RequireAuth />
    if (!user) return;

    // Evitar loop si ya estamos en la página de cambio de clave
    if (user.mustChangePassword && !pathname.startsWith("/change-password")) {
      router.replace(`/change-password?next=${encodeURIComponent(here)}`);
    }
  }, [isLoading, user, pathname, here, router]);

  // Mientras carga el user, o si vamos a redirigir, no renderizamos el dashboard
  if (isLoading) return null;
  if (user?.mustChangePassword && !pathname.startsWith("/change-password")) {
    return null;
  }

  return <>{children}</>;
}
