"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getReceipts, signReceipt } from "../api";
import type { ApiResponse, Receipt, TabKey } from "../types";

export function useReceipts(refreshKey: string | null) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [tab, setTab] = useState<TabKey>("pending");
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReceipts();
      setData(res);
      const first = res.pending[0] || res.signed[0] || null;
      setSelected(first);
      setTab(first && !first.signed ? "pending" : "signed");
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "No se pudieron cargar los documentos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);           // mount
  useEffect(() => { if (refreshKey) fetchDocs(); }, [refreshKey, fetchDocs]); // reclick sidebar

  const list = useMemo(
    () => (tab === "pending" ? data?.pending ?? [] : data?.signed ?? []),
    [tab, data]
  );

  const handleSign = useCallback(async (disagree = false) => {
    if (!selected) return;
    setSigning(true);
    try {
      await signReceipt(selected.id, disagree);
      toast.success(disagree ? "Firmado en disconformidad" : "Firmado correctamente");
      await fetchDocs();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "No se pudo firmar");
    } finally {
      setSigning(false);
    }
  }, [selected, fetchDocs]);

  return {
    data, tab, setTab,
    selected, setSelected,
    list,
    loading, signing,
    handleSign,
  };
}
