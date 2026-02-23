"use client";

import useSWR from "swr";
import { axiosInstance } from "@/lib/axios";

export type LeaveItem = {
  id: string;
  type: string;
  status: string;
  note: string;
  startYmd: string;
  endYmd: string;
  daysCount: number;
  createdAt: string;
};

const fetcher = (url: string) =>
  axiosInstance.get(url).then(res => res.data);

type Params = {
  type?: "VACACIONES" | "OTHER";
  q?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
};

export function useLeaves(params?: Params) {
  const enabled = params?.enabled ?? true;

  const sp = new URLSearchParams();
  if (params?.type) sp.set("type", params.type);
  if (params?.q) sp.set("q", params.q);
  sp.set("page", String(params?.page ?? 1));
  sp.set("pageSize", String(params?.pageSize ?? 10));

  const query = sp.toString() ? `/leaves?${sp.toString()}` : "/leaves";

  const { data, error, isLoading, mutate } = useSWR(
    enabled ? query : null,
    fetcher,
    {
      refreshInterval: enabled ? 8000 : 0,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );

  return {
    leaves: data?.data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}
