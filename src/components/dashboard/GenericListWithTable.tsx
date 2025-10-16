// app/(dashboard)/components/GenericListWithTable/GenericListWithTable.tsx
"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";

export interface DataTableProps<T> {
  data: T[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearchChange: (query: string) => void;
  columns: ColumnDef<T, any>[];
  sorting: SortingState;
  onSortingChange: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
  searchPlaceholder?: string;
}

interface GenericListWithTableProps<T> {
  endpoint?: string;
  columns: ColumnDef<T, any>[];
  filters?: Record<string, any>;
  externalSearch?: string;
  DataTableComponent: React.ComponentType<DataTableProps<T>>;
  pageSize?: number;
  refreshToken?: any;
  clientData?: T[];

  paramNames?: {
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortDir?: string;
  };

  responseAdapter?: (raw: any) => { items: T[]; total: number; pageCount?: number };
}

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// Mantiene el spinner visible un mínimo para evitar “flicker”
function useBusyDelay(busy: boolean, min = 200) {
  const [vis, setVis] = useState(busy);
  useEffect(() => {
    if (busy) {
      setVis(true);
      return;
    }
    const t = setTimeout(() => setVis(false), min);
    return () => clearTimeout(t);
  }, [busy, min]);
  return vis;
}

function stableStringify(obj: Record<string, any>) {
  const keys = Object.keys(obj).sort();
  return JSON.stringify(obj, keys);
}

export function GenericListWithTable<T>({
  endpoint,
  columns,
  filters,
  externalSearch = "",
  DataTableComponent,
  pageSize = 10,
  refreshToken,
  clientData,
  paramNames,
  responseAdapter,
}: GenericListWithTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  // búsqueda con debounce
  const [searchDraft, setSearchDraft] = useState(externalSearch);
  useEffect(() => setSearchDraft(externalSearch), [externalSearch]);
  const debouncedSearch = useDebounce(searchDraft, 350);
  const isDebouncing = searchDraft !== debouncedSearch; // 👈 NUEVO

  const activeSort = sorting[0];

  const pn = useMemo(() => ({
    search: "search",
    page: "page",
    limit: "limit",
    sortBy: "sortBy",
    sortDir: "sortDir",
    ...(paramNames ?? {}),
  }), [paramNames]);

  const params = useMemo(() => {
    const base: Record<string, any> = {
      [pn.page]: page,
      [pn.limit]: pageSize,
      ...(filters ?? {}),
    };
    if (debouncedSearch?.trim()) base[pn.search] = debouncedSearch.trim();
    if (activeSort) {
      base[pn.sortBy] = activeSort.id;
      base[pn.sortDir] = activeSort.desc ? "desc" : "asc";
    }
    return base;
  }, [debouncedSearch, page, pageSize, activeSort, filters, pn]);

  const requestKey = useMemo(() => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
    }
    return sp.toString();
  }, [stableStringify(params)]);

  const didInit = useRef(false);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    if (clientData) {
      setData(clientData);
      setTotalPages(1);
      setLoading(false);
      return;
    }
    if (!endpoint) return;

    setLoading(true);
    try {
      const res = await axiosInstance.get(endpoint, { params, signal });
      const raw = res.data;

      let items: T[] = [];
      let total = 0;
      let pageCount: number | undefined;

      try {
        if (responseAdapter) {
          const adapted = responseAdapter(raw);
          items = Array.isArray(adapted?.items) ? adapted.items : [];
          total = Number(adapted?.total ?? 0);
          pageCount = adapted?.pageCount;
        } else if (raw?.data && raw?.meta) {
          items = Array.isArray(raw.data) ? raw.data : [];
          total = Number(raw?.meta?.total ?? items.length);
          pageCount = raw?.meta?.pageCount;
        } else if (raw?.items) {
          items = Array.isArray(raw.items) ? raw.items : [];
          total = Number(raw?.total ?? items.length);
        } else if (Array.isArray(raw)) {
          items = raw;
          total = raw.length;
        }
      } catch (e) {
        console.error("responseAdapter error:", e);
      }

      setData(items);
      const pages = pageCount ?? Math.max(1, Math.ceil((total || 0) / pageSize));
      setTotalPages(pages);
    } catch (error: any) {
      if (axios.isCancel?.(error) || error?.name === "CanceledError" || error?.message === "canceled") return;
      console.error("Error en GenericListWithTable:", error);
    } finally {
      setLoading(false);
    }
  }, [clientData, endpoint, requestKey, pageSize, responseAdapter]);

  // reset a página 1 cuando cambia search externo (y muestra loading)
  useEffect(() => {
    setPage(1);
    setLoading(true); // 👈 feedback inmediato si externalSearch cambia
  }, [externalSearch]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (!didInit.current) {
        didInit.current = true;
      }
    }
    const ctrl = new AbortController();
    fetchData(ctrl.signal);
    return () => ctrl.abort();
  }, [endpoint, requestKey, refreshToken, fetchData]);

  // Loading para UI: muestra mientras tipeás (debounce) o mientras hay request
  const uiLoading = useBusyDelay(loading || isDebouncing, 200); // 👈 NUEVO

  return (
    <div className="mt-4 space-y-4">
      <DataTableComponent
        columns={columns}
        data={data}
        loading={uiLoading}                    // 👈 ANTES: loading
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
        onSearchChange={(val) => {
          setSearchDraft(val);
          setPage(1);
          setLoading(true);                    // 👈 feedback instantáneo al teclear
        }}
        sorting={sorting}
        onSortingChange={(updater) =>
          setSorting((old) => (typeof updater === "function" ? (updater as any)(old) : updater))
        }
      />
    </div>
  );
}
