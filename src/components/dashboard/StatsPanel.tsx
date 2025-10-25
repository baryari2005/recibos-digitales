// src/components/dashboard/StatsPanel.tsx
"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, FileSignature, Gift, Palmtree, Plane } from "lucide-react";
import type { Stat as BaseStat } from "./types";

type Stat = BaseStat & {
  disabled?: boolean;
  disabledHint?: string;
};

function resolveIcon(name: BaseStat["iconName"]) {
  switch (name) {
    case "FileSignature": return <FileSignature className="h-10 w-10" />;
    case "ClipboardList": return <ClipboardList className="h-10 w-10" />;
    case "Plane":         return <Plane className="h-10 w-10" />;
    case "Gift":          return <Gift className="h-10 w-10" />;
    default:              return <Palmtree className="h-10 w-10" />;
  }
}

type Density = "compact" | "normal";

const DENSITY = {
  compact: { content: "px-3 py-2 h-14", iconPad: "p-1.5", top: "text-[18px]", bottom: "text-[13px]" },
  normal:  { content: "p-4",             iconPad: "p-2",   top: "text-sm",       bottom: "text-xs"   },
} as const;

// Wrapper que SOLO agrega "manito" si es clickeable; mantiene deshabilitados tal cual
function ActionWrapper({ stat, children }: { stat: Stat; children: React.ReactNode }) {
  const disabled = !!stat.disabled;
  const clickable = !disabled && (Boolean(stat.onClick) || Boolean(stat.href));
  const cursor = disabled ? "cursor-not-allowed"
                : clickable ? "cursor-pointer"
                : "cursor-default";

  if (stat.onClick && !disabled) {
    return (
      <button type="button" onClick={stat.onClick} className={`block w-full text-left ${cursor}`}>
        {children}
      </button>
    );
  }
  if (stat.href && !disabled) {
    return (
      <Link href={stat.href} className={`block w-full ${cursor}`} aria-label={stat.labelTop}>
        {children}
      </Link>
    );
  }
  // ni clickeable ni deshabilitado → cursor normal (sin manito)
  return (
    <div className={`block w-full ${cursor}`} aria-disabled={disabled || undefined}>
      {children}
    </div>
  );
}

export function StatsPanel({
  stats,
  density = "compact",
}: {
  stats: Stat[];
  density?: Density;
}) {
  const d = DENSITY[density];

  return (
    <div className="grid gap-3">
      {stats.map((s) => {
        const disabled = Boolean(s.disabled);

        return (
          <Card
            key={s.id}
            className={`relative border shadow-sm mb-3 ${disabled ? "opacity-60 grayscale" : ""}`}
            aria-disabled={disabled}
          >
            {/* Overlay y “difuminado” SIGUEN IGUAL para no implementados */}
            {disabled && (
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-muted/50 backdrop-blur-[1px] flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground bg-background/90 px-2 py-1 rounded-md border whitespace-pre-line">
                  {s.disabledHint ?? "Funcionalidad no implementada"}
                </span>
              </div>
            )}

            <ActionWrapper stat={s}>
              <CardContent
                className={`${d.content} flex items-center justify-between ${disabled ? "pointer-events-none" : ""}`}
                title={disabled ? (s.disabledHint ?? "Funcionalidad no implementada") : undefined}
              >
                <div className="flex items-center gap-2">
                  <div className={`rounded-md bg-white ${d.iconPad}`}>{resolveIcon(s.iconName)}</div>
                  <div className="leading-tight">
                    <div className={`${d.top} font-bold`}>{s.labelTop}</div>
                    <div className={`${d.bottom} text-muted-foreground uppercase tracking-wide whitespace-pre-line`}>
                      {s.labelBottom}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-semibold mr-4">{s.value}</div>
              </CardContent>
            </ActionWrapper>
          </Card>
        );
      })}
    </div>
  );
}
