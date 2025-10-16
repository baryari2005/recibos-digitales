"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";

type MeResponse = {
  user: {
    id: string;
    userId: string | null;
    email: string;
    nombre: string | null;
    apellido: string | null;
    avatarUrl: string | null;
    rol?: { id: number; nombre: string } | null;
  } | null;
};

export function useCurrentUser() {
  const [user, setUser] = useState<MeResponse["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axiosInstance.get<MeResponse>("/auth/me");
        if (!alive) return;
        setUser(res.data.user ?? null);
      } catch {
        if (!alive) return;
        setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { user, loading };
}
