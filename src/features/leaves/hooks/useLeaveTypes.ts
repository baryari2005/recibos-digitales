"use client";

import useSWR from "swr";
import axios from "axios";

export type LeaveTypeItem = {
  code: string;
  label: string;
};

const fetcher = (url: string) =>
  axios.get(url).then((r) => r.data);

export function useLeaveTypes() {
  const { data, isLoading } = useSWR<LeaveTypeItem[]>(
    "/api/leave-types",
    fetcher
  );

  return {
    types: data ?? [],
    isLoading,
  };
}
