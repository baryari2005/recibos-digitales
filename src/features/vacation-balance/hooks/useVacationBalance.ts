import useSWR from "swr";
import { axiosInstance } from "@/lib/axios";

const fetcher = (url: string) =>
  axiosInstance.get(url).then(res => res.data);

export function useVacationBalance() {
  const { data, error, isLoading, mutate } = useSWR(
    "/leaves/balance",
    fetcher,
    {
      refreshInterval: 8000,
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );

  return {
    balance: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
