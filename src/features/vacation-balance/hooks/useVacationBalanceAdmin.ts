"use client";

import { useMemo, useState } from "react";
import type { VacationBalanceItem } from "@/features/vacation-balance/types/types";

export function useVacationBalanceAdmin() {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [editing, setEditing] = useState<VacationBalanceItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const year = useMemo(() => new Date().getFullYear(), []);

  const refresh = () => setRefreshVersion((v) => v + 1);

  return {
    year,
    refreshVersion,
    editing,
    creating,
    bulkOpen,

    setEditing,
    setCreating,
    setBulkOpen,

    refresh,
  };
}