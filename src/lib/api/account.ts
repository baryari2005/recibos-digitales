// src/lib/api/account.ts
import { axiosInstance } from "@/lib/axios";

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  const { data } = await axiosInstance.post("/auth/change-password", payload, {
    withCredentials: true,
    skipAuthRedirect: true as any, // 👈 evita que el interceptor te mande a /login en 401
  });
  return data;
}

export async function changeEmail(payload: { email: string; password: string }) {
  const { data } = await axiosInstance.post("/auth/change-email", payload, {
    withCredentials: true,
    skipAuthRedirect: true as any, // idem
  });
  return data;
}

export async function changeMyAvatar(payload: { avatarUrl: string }) {
  const { data } = await axiosInstance.post(
    "/auth/change-avatar",
    payload,                    // 👈 directo, no { payload }
    { withCredentials: true, skipAuthRedirect: true as any }
  );
  return data;
}

// export async function changeMyAvatarFromTmp(tmpPath: string) {
//   const { data } = await axiosInstance.post("/auth/change-avatar-from-tmp", { tmpPath }, {
//     withCredentials: true,
//     skipAuthRedirect: true as any, // opcional pero recomendado
//   });
//   return data;
// }
