// components/dashboard/QuoteBanner.tsx
"use client";

type Props = {
  title?: string;
  quote: string;
  author: string;
  subtitle?: string;
  illustrationSrc?: string;
  className?: string;
  height?: "compact" | "normal" | "tall";
  size?: "sm" | "md" | "lg";
};

const HEIGHTS = {
  compact: "min-h-[110px]",
  normal: "min-h-[160px]",
  tall: "min-h-[220px]",
} as const;

const SIZES = {
  sm: { pad: "pl-4 py-3", artImg: "h-16", radius: "rounded-xl" },
  md: { pad: "pl-6 py-5", artImg: "h-24", radius: "rounded-2xl" },
  lg: { pad: "pl-8 py-6", artImg: "h-32", radius: "rounded-3xl" },
} as const;

export function QuoteBanner({
  title = "Frase del día",
  quote,
  author,
  subtitle,
  illustrationSrc = "/quote-illustration.png",
  className,
  height = "normal",
  size = "md",
}: Props) {
  const h = HEIGHTS[height];
  const s = SIZES[size];

  return (
    <section className={className}>
      <div
        //className={`relative ${h} ${s.radius} overflow-hidden border bg-gradient-to-r from-slate-100 to-slate-50 text-slate-900`}
        className={`group relative ${h} ${s.radius} overflow-hidden border text-indigo-950 transition-colors duration-300
                    bg-[linear-gradient(135deg,_#F2F9F9_0%,_#99D1D3_45%,_#008C93_100%)]
                    hover:bg-[linear-gradient(135deg,_#EAF6F7_0%,_#8CC8CB_45%,_#00777C_100%)]
                  `}
      >
        <div className="grid h-full grid-cols-[1fr_auto] items-center">
          <div className={`${s.pad} pr-4`}>
            <p className="text-[16px] font-semibold tracking-wider text-slate-500 uppercase">
              {title}
            </p>
            <p className="mt-1 text-sm-plus font-bold leading-6">{quote}</p>
            <p className="mt-2 text-sm text-slate-500">
              {author}
              {subtitle ? ` — ${subtitle}` : null}
            </p>
          </div>

          {/* Imagen pegada al borde derecho como en Welcome */}
          <div className="h-full pr-0 pt-5 flex items-end justify-end">
            <img
              alt="Quote illustration"
              src={illustrationSrc}
              className={`${s.artImg} w-auto justify-center pointer-events-none select-none`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
