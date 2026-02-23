import { StatusPage } from "@/components/status/StatusPage";

export default function DashboardNotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="No encontramos esa sección"
      description="La página no existe o todavía no está disponible."
      imageSrc="/robot-404.png"
      primaryAction={{ label: "Ir al inicio", href: "/" }} // tu home actual del dashboard
    />
  );
}