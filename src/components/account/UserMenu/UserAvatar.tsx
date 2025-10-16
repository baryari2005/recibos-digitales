// src/components/account/UserAvatar.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils/initials";

type Props = {
  src?: string | null;
  name?: string | null;
  className?: string;
  fallbackBgClass?: string;
  textClass?: string;
};

export function UserAvatar({
  src,
  name,
  className,
  fallbackBgClass = "bg-[#008C93]",
  textClass = "text-white",
}: Props) {
  const display = initials(name);
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      {/* usa <img> nativo (Radix) con fallback automático */}
      <AvatarImage src={src ?? undefined} alt={name ?? "Avatar"} />
      <AvatarFallback className={cn(fallbackBgClass, textClass)}>
        {display}
      </AvatarFallback>
    </Avatar>
  );
}
