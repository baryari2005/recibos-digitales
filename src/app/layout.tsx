// src/app/layout.tsx
import MobileUnsupported from "@/components/MobileUnsupported";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Poppins } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { JetBrains_Mono } from "next/font/google"; // súper notoria
import { Inter } from "next/font/google"; // usá la que quieras

const appSans = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-app-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans", // usamos la misma variable que mapea Tailwind
  display: "swap",
});

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
