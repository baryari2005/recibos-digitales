"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export type AdminPendingLeave = {
  id: string;
  type: string;
  startYmd: string;
  endYmd: string;
  daysCount: number;
  createdAt: string;
  user: {
    id: string;
    nombre: string | null;
    apellido: string | null;
    email: string;
  } | null;
};

type Params = {
  type?: "VACACIONES" | "OTHER";
};

export function useAdminPendingLeaves(params?: Params) {
  const [items, setItems] = useState<AdminPendingLeave[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const query = params?.type
    ? `/api/admin/leaves/pending?type=${params.type}`
    : "/api/admin/leaves/pending";

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(query, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(data.data);
    } finally {
      setLoading(false);
    }
  }, [query, token]);

  useEffect(() => {
    void fetchLeaves();
    const interval = setInterval(() => {
      void fetchLeaves();
    }, 20000);

    return () => clearInterval(interval);
  }, [fetchLeaves]);

  return { items, loading, refetch: fetchLeaves };
}