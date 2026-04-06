"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  avatarUrl?: string;
  fullName: string;
  email: string;
};

export function UserMenuHeader({ avatarUrl, fullName, email }: Props) {
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "US";

  return (
    <div className="p-4 text-center">
      <div className="flex justify-center">
        <Avatar className="h-14 w-14">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="font-medium">{initials}</AvatarFallback>
        </Avatar>
      </div>

      <div className="mt-2">
        <div className="text-sm font-semibold leading-5">{fullName}</div>
        <div className="text-xs text-muted-foreground">{email}</div>
      </div>
    </div>
  );
}