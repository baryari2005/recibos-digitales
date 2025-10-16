"use client";

import { useState } from "react";
import { useAuth } from "@/stores/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LockKeyhole, Mail, Image as ImageIcon } from "lucide-react";
import { UserMenuTriggerButton } from "./UserMenuTriggerButton";
import { UserMenuHeader } from "./UserMenuHeader";
import { MenuItemWithSubtitle } from "./MenuItemWithSubtitle";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { ChangeEmailDialog } from "./ChangeEmailDialog";
import { ChangeAvatarDialog } from "./ChangeAvatarDialog";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [openPwd, setOpenPwd] = useState(false);
  const [openEmail, setOpenEmail] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);

  const fullName =
    [user?.nombre, user?.apellido].filter(Boolean).join(" ") || user?.userId || "Usuario";
  const email = user?.email || "";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UserMenuTriggerButton avatarUrl={user?.avatarUrl} fullName={fullName} />
        </DropdownMenuTrigger>

        {/* bordes redondeados, sombra linda, sin padding global */}
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-72 p-0 rounded border shadow-xl"
        >
          <UserMenuHeader
            avatarUrl={user?.avatarUrl}
            fullName={fullName}
            email={email}
          />

          <DropdownMenuSeparator className="m-0" />

          <MenuItemWithSubtitle
            icon={LockKeyhole}
            title="Editar contraseña"
            subtitle="Cambiar clave de acceso"
            onClick={() => setOpenPwd(true)}
          />
          <MenuItemWithSubtitle
            icon={Mail}
            title="Editar email"
            subtitle="Cambiar email personal"
            onClick={() => setOpenEmail(true)}
          />
          <MenuItemWithSubtitle
            icon={ImageIcon}
            title="Editar avatar"
            subtitle="Cambiar imagen de perfil"
            onClick={() => setOpenAvatar(true)}
          />

          <DropdownMenuSeparator className="m-0" />

          <DropdownMenuItem onClick={logout} className="cursor-pointer py-3">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Salir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog open={openPwd} onOpenChange={setOpenPwd} />
      <ChangeEmailDialog currentEmail={email} open={openEmail} onOpenChange={setOpenEmail} />
      <ChangeAvatarDialog open={openAvatar} onOpenChange={setOpenAvatar} />
    </>
  );
}
