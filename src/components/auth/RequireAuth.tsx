"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { CenteredSpinner } from "../CenteredSpinner";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, setToken, fetchMe, triedMe, user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 1) cargar /auth/me una sola vez
  useEffect(() => {
    if (!triedMe) fetchMe();
  }, [triedMe, fetchMe]);

  // 2) sincronizar con localStorage y, si falta token, salir y redirigir
  useEffect(() => {
    const sync = () => {
      const ls = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      // si cambió el token en LS respecto del store, actualizar
      if (ls !== token) setToken(ls);

      // si LS no tiene token -> cerrar sesión y llevar a login
      if (!ls) {
        // logout ya limpia el store y navega a /login, pero forzamos next por las dudas
        logout();
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    };

    sync(); // correr ahora
    // correr cuando la pestaña cambia de foco/visibilidad o cambia LS en otra pestaña
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("storage", sync);
    };
  }, [token, setToken, logout, pathname, router]);

  if (!triedMe || loading) return <CenteredSpinner label="Cargando..."/>;
  if (!user) return null; // en lo que redirige al login

  return <>{children}</>;
}
