import { StatusPage } from "@/components/status/StatusPage";

export default function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      title="No tenés permisos para ver esta página"
      description="Si creés que esto es un error, pedile acceso a un administrador."
      imageSrc="/robot-403.png"
      primaryAction={{ label: "Ir al inicio", href: "/" }}
      //secondaryAction={{ label: "Ir al inicio", href: "/" }}
    />
  );
}