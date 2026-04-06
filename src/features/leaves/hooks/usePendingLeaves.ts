"use client";

import useSWR from "swr";
import { axiosInstance } from "@/lib/axios";
import { useCan } from "@/hooks/useCan";

type Options = {
  type?: "VACACIONES" | "OTHER";
};

const fetcher = (url: string) =>
  axiosInstance.get(url).then((res) => res.data);

export function usePendingLeaves(options?: Options) {
  const canVacationLoad = useCan("vacaciones", "cargar");
  const canVacationApprove = useCan("vacaciones", "aprobar");
  const canOtherLoad = useCan("licencias", "cargar");
  const canOtherApprove = useCan("licencias", "aprobar");

  const canViewVacations = canVacationLoad || canVacationApprove;
  const canViewOtherLeaves = canOtherLoad || canOtherApprove;

  const canFetch =
    options?.type === "VACACIONES"
      ? canViewVacations
      : options?.type === "OTHER"
        ? canViewOtherLeaves
        : canViewVacations || canViewOtherLeaves;

  const key = canFetch
    ? `/leaves/pending-count?type=${options?.type ?? ""}`
    : null;

  const { data, isLoading, mutate } = useSWR(key, fetcher, {
    refreshInterval: canFetch ? 8000 : 0,
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });

  return {
    count: data?.count ?? 0,
    loading: canFetch ? isLoading : false,
    refresh: mutate,
  };
}