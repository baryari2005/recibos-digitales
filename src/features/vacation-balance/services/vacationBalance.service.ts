import { axiosInstance } from "@/lib/axios";

export async function createVacationBalance(payload: {
  userId: string;
  year: number;
  totalDays: number;
}) {
  const { data } = await axiosInstance.post("/admin/vacation-balance", payload);
  return data;
}

export async function updateVacationBalance(
  id: string,
  payload: { totalDays: number }
) {
  const { data } = await axiosInstance.patch(
    `/admin/vacation-balance/${id}`,
    payload
  );
  return data;
}

export async function deleteVacationBalance(id: string) {
  const { data } = await axiosInstance.delete(`/admin/vacation-balance/${id}`);
  return data;
}

export async function bulkCreateVacationBalance() {
  const { data } = await axiosInstance.post(
    "/admin/vacation-balance/bulk",
    {}
  );
  return data;
}