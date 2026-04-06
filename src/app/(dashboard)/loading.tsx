// src/app/(dashboard)/loading.tsx
import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border bg-white/70 backdrop-blur p-8 shadow-sm text-center dark:bg-slate-950/40">
        {/* Robot */}
        <div className="relative mx-auto w-fit">
          <div className="animate-float">
            <Image
              src="/loading-robot.png"
              alt="Cargando..."
              width={260}
              height={260}
              priority
              className="select-none"
            />
          </div>

          {/* Glow tenue marca */}
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl opacity-15 bg-[#008C93]" />
        </div>

        {/* Título */}
        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-slate-50">
          Cargando…
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Estamos preparando todo para vos.
        </p>

        {/* Barra de progreso “infinita” */}
        <div className="mt-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/70">
            <div className="h-full w-1/3 animate-loading-bar rounded-full bg-[#008C93]" />
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="relative inline-flex h-5 w-5">
              <span className="absolute inset-0 rounded-full border-2 border-[#008C93]/25" />
              <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#008C93] animate-spin" />
            </span>
            <span>Por favor esperá un momento…</span>
          </div>
        </div>
      </div>

      {/* Animación barra (sin styled-jsx) */}
      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
        .animate-loading-bar {
          animation: loadingBar 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}