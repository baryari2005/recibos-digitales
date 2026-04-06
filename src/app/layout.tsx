// src/app/layout.tsx
import MobileUnsupported from "@/components/layout/MobileUnsupported";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-app-sans",
  display: "swap",
});

export const metadata = { title: "Sistema de Gestión de Documentos Laborales" };


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className="font-sans antialiased">
        {/* App solo en pantallas grandes */}
        <div className="hidden lg:block">
          {children}
          <Toaster />
        </div>

        {/* Cartel en móvil / ventana chica */}
        <div className="lg:hidden">
          <MobileUnsupported />
        </div>
      </body>
    </html>
  );
}
