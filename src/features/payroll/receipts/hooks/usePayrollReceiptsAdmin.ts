"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getAllPayrollReceipts } from "../services/receiptsAdmin.service";
import type { ApiResponse, ReceiptFilterStatus } from "../types/types";
import { getAxiosMessage } from "@/lib/errors/getAxiosErrorMessage";

type Params = {
  enabled: boolean;
};

export function usePayrollReceiptsAdmin({ enabled }: Params) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ReceiptFilterStatus>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [openCuil, setOpenCuil] = useState<Record<string, boolean>>({});

  const queryString = useMemo(() => {
    const p = new URLSearchParams();

    if (q.trim()) p.set("q", q.trim());
    if (status !== "all") p.set("status", status);
    if (from) p.set("from", from);
    if (to) p.set("to", to);

    return p.toString();
  }, [q, status, from, to]);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);

    try {
      const response = await getAllPayrollReceipts({
        q,
        status,
        from,
        to,
      });

      setData(response);
    } catch (e: unknown) {
      toast.error(getAxiosMessage(e, "No se pudieron cargar los recibos"));
    } finally {
      setLoading(false);
    }
  }, [enabled, q, status, from, to]);

  useEffect(() => {
    if (!enabled) return;
    fetchData();
  }, [enabled, fetchData]);

  const applyFilters = () => {
    fetchData();
  };

  const clearFilters = () => {
    setQ("");
    setFrom("");
    setTo("");
    setStatus("all");
  };

  const clearAndReload = async () => {
    setQ("");
    setFrom("");
    setTo("");
    setStatus("all");

    setTimeout(() => {
      getAllPayrollReceipts({})
        .then(setData)
        .catch((e: unknown) => {
          toast.error(getAxiosMessage(e, "No se pudieron cargar los recibos"));
        });
    }, 0);
  };

  const toggleGroup = (cuil: string) => {
    setOpenCuil((prev) => ({
      ...prev,
      [cuil]: !(prev[cuil] ?? true),
    }));
  };

  return {
    q,
    setQ,
    status,
    setStatus,
    from,
    setFrom,
    to,
    setTo,
    loading,
    data,
    openCuil,
    queryString,
    applyFilters,
    clearFilters,
    clearAndReload,
    toggleGroup,
    fetchData,
  };
}