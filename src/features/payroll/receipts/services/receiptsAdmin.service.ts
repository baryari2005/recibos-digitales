import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, ReceiptsQueryParams } from "../types/types";

export async function getAllPayrollReceipts(params: ReceiptsQueryParams) {
  const cleanParams: Record<string, string> = {};

  if (params.q?.trim()) cleanParams.q = params.q.trim();
  if (params.status && params.status !== "all") cleanParams.status = params.status;
  if (params.from) cleanParams.from = params.from;
  if (params.to) cleanParams.to = params.to;

  const { data } = await axiosInstance.get<ApiResponse>(
    "/payroll/receipts/all",
    {
      params: cleanParams,
      withCredentials: true,
    }
  );

  return data;
}