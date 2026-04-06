"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, ShieldAlert } from "lucide-react";

export default function DashboardNotFoundPage() {
  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border bg-white/70 backdrop-blur p-8 shadow-sm text-center dark:bg-slate-950/40">
        {/* Robot */}
        <div className="relative mx-auto w-fit">
          <div className="animate-float">
            <Image
              src="/robot-sobrio-404.png"
              alt="Pagina no encontrada."
              width={200}
              height={200}
              priority
              className="select-none"
            />
          </div>

          {/* Glow tenue */}
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl opacity-15 bg-[#008C93]" />
        </div>

        {/* Badge 403 */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#008C93]/10 text-[#008C93]">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <span className="tracking-wide font-bold text-xl">404</span>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">
          Página no encontrada
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          No encontramos esta sección.
          La página no existe o todavía no esá disponible.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded px-4 py-2 text-sm font-semibold bg-[#008C93] text-white hover:opacity-95"
          >
            <Home className="w-4 h-4 mr-2"/>
            Volver al inicio
          </Link>

          <button
            type="button"
            onClick={() => history.back()}
            className="inline-flex items-center justify-center rounded px-4 py-2 text-sm font-semibold border text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Volver atrás
          </button>
        </div>

        {/* Opcional: link “Solicitar acceso” */}
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          ¿Necesitás permisos?{" "}
          <Link href="/soporte" className="text-[#008C93] hover:underline">
            Solicitar acceso
          </Link>
        </div>
      </div>
    </div>
  );
}