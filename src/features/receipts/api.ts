import { axiosInstance } from "@/lib/axios";
import type { ApiResponse } from "./types";

export async function getReceipts() {
  const { data } = await axiosInstance.get<ApiResponse>("/payroll/receipts", {
    params: { signed: true, t: Date.now() },
  });
  return data;
}

export async function signReceipt(id: string, disagree: boolean) {
  await axiosInstance.patch("/payroll/receipts/sign", { id, disagree });
}