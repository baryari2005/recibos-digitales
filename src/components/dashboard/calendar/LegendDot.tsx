// components/dashboard/calendar/LegendDot.tsx
"use client";

export function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      <span>{label}</span>
    </div>
  );
}
