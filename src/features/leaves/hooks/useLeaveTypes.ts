"use client";

import useSWR from "swr";
import { axiosInstance } from "@/lib/axios";

export type LeaveTypeItem = {
  code: string;
  label: string;
};

type LeaveTypesResponse = {
  data?: LeaveTypeItem[];
};

const fetcher = (url: string) =>
  axiosInstance
    .get<LeaveTypesResponse>(url)
    .then((response) => response.data);

export function useLeaveTypes() {
  const { data, isLoading } = useSWR(
    "/leave-types?activeOnly=1&pageSize=100",
    fetcher
  );

  return {
    types: data?.data ?? [],
    isLoading,
  };
}
