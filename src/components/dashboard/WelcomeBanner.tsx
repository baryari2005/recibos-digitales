// components/dashboard/WelcomeBanner.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Clock1, Clock2, Clock3, Clock4, Clock5, Clock6,
  Clock7, Clock8, Clock9, Clock10, Clock11, Clock12,
  type LucideIcon,
} from "lucide-react";

type Props = {
  name: string;
  greeting?: string;
  className?: string;
  height?: "compact" | "normal" | "tall";
  size?: "sm" | "md" | "lg";
  showClock?: boolean;
  /** Si lo pasás, se usa este ícono sí o sí (p. ej. Clock7) */
  clockIcon?: LucideIcon;
  /** Si true, ignora el ícono genérico y usa Clock1..Clock12 según la hora */
  dynamicClockByHour?: boolean;
  timeZone?: string;      // ej: "America/Argentina/Buenos_Aires"
  withSeconds?: boolean;  // reloj con segundos
  artImgClassName?: string;
};

const HEIGHTS = {
  compact: "min-h-[110px]",
  normal: "min-h-[160px]",
  tall: "min-h-[220px]",
} as const;

const SIZES = {
  sm: { pad: "pl-4 py-3", artImg: "h-28", radius: "rounded-xl" },
  md: { pad: "pl-6 py-5", artImg: "h-24", radius: "rounded-2xl" },
  lg: { pad: "pl-8 py-6", artImg: "h-32", radius: "rounded-3xl" },
} as const;

const CLOCK_BY_HOUR: Record<number, LucideIcon> = {
  1: Clock1, 2: Clock2, 3: Clock3, 4: Clock4, 5: Clock5, 6: Clock6,
  7: Clock7, 8: Clock8, 9: Clock9, 10: Clock10, 11: Clock11, 12: Clock12,
};

function computeGreeting(date: Date, tz?: string) {
  const hour = getHour24(date, tz);
  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function getHour24(date: Date, timeZone?: string) {
  // usamos Intl para respetar la zona horaria
  return Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone }).format(date)
  );
}

function formatTime(date: Date, tz?: string, withSeconds?: boolean) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hour12: false,
    timeZone: tz,
  }).format(date);
}

export function WelcomeBanner({
  name,
  greeting,
  className,
  height = "normal",
  size = "md",
  showClock = false,
  clockIcon,
  dynamicClockByHour = false,
  timeZone = "America/Argentina/Buenos_Aires",
  withSeconds = false,
  artImgClassName
}: Props) {
  const h = HEIGHTS[height];
  const s = SIZES[size];

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const ms = withSeconds ? 1000 : 60_000;
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [withSeconds]);

  const gText = greeting ?? computeGreeting(now, timeZone);
  const timeText = formatTime(now, timeZone, withSeconds);

  // elegir ícono:
  const hour24 = getHour24(now, timeZone);
  const hour12 = (hour24 % 12) || 12;           // 0 → 12
  const AutoIcon = CLOCK_BY_HOUR[hour12];
  const FinalIcon = clockIcon ?? (dynamicClockByHour ? AutoIcon : Clock);

  return (
    <section className={className}>
      <div className={`relative ${h} ${s.radius} overflow-hidden border bg-gradient-to-r from-indigo-50 to-indigo-100/60 text-indigo-950`}>
        <div className="grid h-full grid-cols-[1fr_auto] items-center">
          <div className={`${s.pad} pr-4`}>
            <p className="text-xl text-indigo-900/70">
              Hola <span className="font-semibold text-indigo-950">{name}</span>,
            </p>
            <h2 className="text-xl font-semibold text-indigo-900/70 mt-1">
              <span className="inline-flex items-center gap-2">
                {gText},
                {showClock && (
                  <>
                    <FinalIcon style={{ width: 16, height: 16 }} aria-hidden />
                    <time dateTime={now.toISOString()}>{timeText}</time>
                  </>
                )}
              </span>
            </h2>
          </div>

          <div className="h-full pr-0 flex items-end justify-end">
            <img
              alt="Illustration"
              src="/welcome.png"
              className={`${s.artImg} w-auto pointer-events-none select-none ${artImgClassName ?? ""}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
