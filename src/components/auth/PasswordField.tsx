"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { IconInput } from "@/components/inputs/IconInput";
import { Eye, EyeOff, Lock } from "lucide-react";

type Props = {
  id: string;
  label: string;
  registration: any; // RHF register(...) return; si querés lo tipamos más estricto luego
  error?: string;
  autoComplete?: string;
  placeholder?: string;
};

export function PasswordField({
  id,
  label,
  registration,
  error,
  autoComplete = "new-password",
  placeholder,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </label>

      <IconInput
        id={id}
        leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
        rightAdornment={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Eye className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        }
        input={
          <Input
            id={id}
            type={show ? "text" : "password"}
            autoComplete={autoComplete}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className="h-11 rounded border pl-9 pr-10"
            {...registration}
          />
        }
      />

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
