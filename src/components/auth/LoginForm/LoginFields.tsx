"use client";
import { UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { IconInput } from "@/components/inputs/IconInput";

type Props = { form: UseFormReturn<{ userId: string; password: string }>; errors: any; };

export function LoginFields({ form, errors }: Props) {
  const [show, setShow] = useState(false);
  const { register } = form;

  return (
    <>
      <div className="space-y-1">
        <label htmlFor="userId" className="text-sm text-muted-foreground">Usuario</label>
        <IconInput
          id="userId"
          leftIcon={<User className="h-4 w-4 text-muted-foreground" />}
          input={
            <Input id="userId" autoComplete="username" {...register("userId")}
              aria-invalid={!!errors.userId} className="h-11 rounded border pl-9 pr-3" />
          }
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm text-muted-foreground">Contraseña</label>
        <IconInput
          id="password"
          leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
          rightAdornment={
            <button type="button" onClick={() => setShow(s => !s)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {show ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
            </button>
          }
          input={
            <Input id="password" type={show ? "text" : "password"} autoComplete="current-password"
              {...register("password")} aria-invalid={!!errors.password} className="h-11 rounded border pl-9 pr-10" />
          }
        />
      </div>
    </>
  );
}
