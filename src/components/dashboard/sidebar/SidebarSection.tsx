"use client";

type Props = {
  label: string;
  collapsed?: boolean;
};

export function SidebarSection({ label, collapsed }: Props) {
  if (collapsed) return null;

  return (
    <div className="px-4 mt-4 mb-1 text-[10px] uppercase tracking-wider text-white/60 transition-opacity duration-200">
      {label}
    </div>
  );
}