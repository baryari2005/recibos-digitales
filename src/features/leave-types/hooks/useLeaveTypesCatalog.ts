"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import type { LeaveTypeItem } from "../types/leave-type.type";

type LeaveTypesListResponse = {
  data?: LeaveTypeItem[];
};

export function useLeaveTypesCatalog(enabled: boolean) {
  const [items, setItems] = useState<LeaveTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const fetchLeaveTypes = async () => {
      setIsLoading(true);

      try {
        const { data } = await axiosInstance.get<LeaveTypesListResponse>(
          "/leave-types"
        );

        setItems(data.data ?? []);
      } catch (error) {
        console.error("Error al cargar tipos de licencia:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveTypes();
  }, [enabled]);

  return {
    items,
    isLoading,
  };
}
