// components/MenuItemWithSubtitle.tsx
"use client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils"; // si no tenés cn, podés omitirlo

export function MenuItemWithSubtitle({
  icon: Icon,
  title,
  subtitle,
  onClick,
  className,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className={cn(
        "py-3 px-3 focus:bg-accent/60 focus:text-foreground",
        "gap-3 items-start",
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
    </DropdownMenuItem>
  );
}
