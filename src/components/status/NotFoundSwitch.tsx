"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusPage } from "@/components/status/StatusPage";
import { CenteredSpinner } from "../CenteredSpinner";

export function NotFoundSwitch2() {
  const router = useRouter();
  const [showPublic404, setShowPublic404] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/oops"); // 404 dentro del dashboard
      return;
    }
    setShowPublic404(true); // 404 público
  }, [router]);

  if (!showPublic404) {
    return (
    //   <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
    //     Redirigiendo…
    //   </div>
    <CenteredSpinner label="Redirigiendo..." />
    );
  }

  return (
    <StatusPage
      code="404"
      title="Página no encontrada"
      description="La URL que ingresaste no existe o todavía no está disponible."
      imageSrc="/images/robot-404.png"
      primaryAction={{ label: "Ir al login", href: "/login" }}
      secondaryAction={{ label: "Volver al inicio", href: "/" }}
    />
  );
}