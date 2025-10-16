// src/components/account/ChangeAvatarDialog.tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AvatarUploader } from "@/components/Settings/AvatarUploader";
import { useAvatarStaging } from "@/features/users/hooks/useAvatarStaging";
import { pathFromPublicUrl } from "@/features/users/utils";
import { useAuth } from "@/stores/auth"; // donde tengas user + logout
import { Separator } from "@/components/ui/separator";
import { FileImage, Loader2 } from "lucide-react";
import { formatMessage } from "@/utils/formatters";
import { changeMyAvatar, changePassword } from "@/lib/api/account";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function ChangeAvatarDialog({ open, onOpenChange }: Props) {
  const { user, logout } = useAuth();                 // 👈 tu usuario logueado
  const { tmpPath, setTmpPath, commit } = useAvatarStaging();
  const oldKey = pathFromPublicUrl(user?.avatarUrl);  // ej: users/<id>.jpg
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setTmpPath(null); }, [open, setTmpPath]);

  const onSave = async () => {
    if (!tmpPath) {
      toast.error("Seleccioná una imagen primero");
      return;
    }
    try {
      setSaving(true);
      // mueve de avatars/tmp/... a avatars/users/<id>.<ext> y devuelve { key, publicUrl }
      const r = await commit(`users/${user!.id}`, oldKey);

      const res = await changeMyAvatar({ avatarUrl: r.publicUrl });
      // guarda en tu usuario logueado
      //await axiosInstance.post("/auth/change-avatar", { avatarUrl: r.publicUrl });

      toast.success("Avatar actualizado. Vuelve a iniciar sesión.");
      onOpenChange(false);
      onOpenChange(false);                    // 👈 cierra el modal
      setTimeout(() => logout(), 1500);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? "No se pudo actualizar el avatar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-sm p-0">
        <DialogHeader className="px-5 pt-4 pb-2">
          <DialogTitle className="text-sm-plus font-semibold flex">
            <FileImage className="w-4 h-4 mr-2" />Cambiar avatar
          </DialogTitle>
          <Separator className="mt-4 mb-4" />
          <DialogDescription className="text-sm-plus  justify-center">
            Cambiar tu avatar de acceso
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 px-5 pb-4">
          <AvatarUploader
            currentUrl={user?.avatarUrl}
            onTempUploaded={({ tmpPath }) => setTmpPath(tmpPath)} // 👈 guardamos el tmp
          />
        </div>


        <DialogFooter className="px-5 py-3 bg-muted/40 border-t rounded-none">
          <DialogClose asChild>
            <Button className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer" >Cancelar</Button>
          </DialogClose>
          <Button onClick={onSave}
            disabled={saving || !tmpPath}
            className="h-11 rounded  bg-[#008C93] hover:bg-[#007381] cursor-pointer">
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                {formatMessage("Guardando...")}
              </span>
            ) : ("Guardar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
