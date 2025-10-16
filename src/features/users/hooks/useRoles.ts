// src/features/users/hooks/useRoles.ts
"use client";
import { useEffect, useState } from "react";
import { listRoles } from "../api";
import type { Role } from "../types";
import { toast } from "sonner";

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setRoles(await listRoles());
      } catch {
        toast.error("No se pudieron cargar los roles");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { roles, loading };
}
