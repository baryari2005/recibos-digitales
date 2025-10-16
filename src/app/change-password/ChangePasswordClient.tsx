"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios";
import { isAxiosError } from "axios";

export default function ChangePasswordClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const [cur, setCur] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await axiosInstance.patch("/auth/change-password", {
        currentPassword: cur,
        newPassword: pwd,
      });
      toast.success("Contraseña actualizada.");
      router.replace("/");
    } catch (e: unknown) {
      const msg = isAxiosError(e) ? e.response?.data?.error : null;
      toast.error(msg ?? "No se pudo actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 space-y-3">
      {sp.get("first") && (
        <p className="text-sm text-muted-foreground">
          Debés cambiar tu contraseña antes de continuar.
        </p>
      )}
      <Input
        type="password"
        placeholder="Contraseña actual"
        value={cur}
        onChange={(e) => setCur(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Nueva contraseña"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
      />
      <Button
        onClick={submit}
        disabled={loading || pwd.length < 6 || cur.length < 1}
      >
        Guardar
      </Button>
    </div>
  );
}
