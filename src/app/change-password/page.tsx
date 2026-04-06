import type { Metadata } from "next";
import ChangePasswordClient from "../../features/change-password/components/ChangePasswordClient";

export const metadata: Metadata = { title: "Cambiar contraseña" };

// ✅ Opciones de segmento SOLO en server files
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return <ChangePasswordClient />;
}
