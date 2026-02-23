import useSWR from "swr";
import { axiosInstance } from "@/lib/axios";

export type PendingLeave = {
  id: string;
  type: string;
  status: string;
  startYmd: string;
  endYmd: string;
  daysCount: number;
  note?: string;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    legajo?: {
      numeroLegajo?: string;
    };
  };
};

const fetcher = (url: string) =>
  axiosInstance.get(url).then((res) => res.data);

export function usePendingApprovals() {
  const { data, error, isLoading, mutate } = useSWR(
    "/admin/leaves/pending",
    fetcher,
    {
      refreshInterval: 8000,      // 🔥 polling
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );

  return {
    items: data?.data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}
