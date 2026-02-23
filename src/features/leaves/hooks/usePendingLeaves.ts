"use client";

import useSWR from "swr";
import { axiosInstance } from "@/lib/axios";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

type Options = {
  type?: "VACACIONES" | "OTHER";
};

const fetcher = (url: string) =>
  axiosInstance.get(url).then(res => res.data);

export function usePendingLeaves(options?: Options) {
  const { user } = useCurrentUser();

  const key = user
    ? `/leaves/pending-count?type=${options?.type ?? ""}`
    : null;

  const { data, isLoading, mutate } = useSWR(
    key,
    fetcher,
    {
      refreshInterval: 8000,      // 🔥 polling
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );

  return {
    count: data?.count ?? 0,
    loading: isLoading,
    refresh: mutate,
  };
}
