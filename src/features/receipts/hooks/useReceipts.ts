"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getReceipts, signReceipt } from "../services/receipts.service";
import { ApiResponse, Receipt, TabKey } from "../types/types";
import { useCan } from "@/hooks/useCan";
import axios from "axios";

export function useReceipts(refreshKey: string | null) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [tab, setTab] = useState<TabKey>("pending");
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);

  const canAccess = useCan("recibos", "ver");
  const canSign = useCan("recibos", "firmar");

  const fetchDocs = useCallback(async () => {
    if (!canAccess) return;

    setLoading(true);

    try {
      const res = await getReceipts();
      setData(res);

      const first = res?.pending?.[0] || res?.signed?.[0] || null;
      setSelected(first);
      setTab(first && !first.signed ? "pending" : "signed");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          (error.response?.data as { error?: string } | undefined)?.error ??
            "No se pudieron cargar los documentos"
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("No se pudieron cargar los documentos");
      }
    } finally {
      setLoading(false);
    }
  }, [canAccess]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  useEffect(() => {
    if (refreshKey) {
      fetchDocs();
    }
  }, [refreshKey, fetchDocs]);

  const list = useMemo(
    () => (tab === "pending" ? data?.pending ?? [] : data?.signed ?? []),
    [tab, data]
  );

  const handleSign = useCallback(
    async (disagree = false) => {
      if (!selected || !canSign) return;

      setSigning(true);

      try {
        await signReceipt(selected.id, disagree);
        toast.success(
          disagree ? "Firmado en disconformidad" : "Firmado correctamente"
        );
        await fetchDocs();
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          toast.error(
            (error.response?.data as { error?: string } | undefined)?.error ??
              "No se pudo firmar"
          );
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("No se pudo firmar");
        }
      } finally {
        setSigning(false);
      }
    },
    [selected, canSign, fetchDocs]
  );

  return {
    data,
    tab,
    setTab,
    selected,
    setSelected,
    list,
    loading,
    signing,
    handleSign,
  };
}