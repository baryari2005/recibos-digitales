"use client";

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";

type Props = {
  avatarUrl?: string;
  fullName?: string;
} & ComponentPropsWithoutRef<typeof Button>;

export const UserMenuTriggerButton = forwardRef<HTMLButtonElement, Props>(
  ({ avatarUrl, fullName, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        aria-label="Abrir menú de usuario"
        className={cn(
          "h-10 w-10 rounded-full p-0 hover:bg-transparent data-[state=open]:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        <UserAvatar src={avatarUrl} name={fullName} />
      </Button>
    );
  }
);

UserMenuTriggerButton.displayName = "UserMenuTriggerButton";