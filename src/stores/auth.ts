"use client";

import { create } from "zustand";
import { axiosInstance, setAuthToken } from "@/lib/axios";

type UserDTO = any;

type State = {
  user: UserDTO | null;
  token: string | null;
  loading: boolean;
  triedMe: boolean;
};

type Actions = {
  setToken: (t: string | null) => void;
  fetchMe: () => Promise<void>;
  login: (body: { email?: string; userId?: string; password: string }) => Promise<boolean>;
  logout: () => void;
};

export const useAuth = create<State & Actions>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  loading: false,
  triedMe: false,

  setToken: (t) => {
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem("token", t);
      else localStorage.removeItem("token");
    }
    setAuthToken(t);
    set({ token: t });
  },

  fetchMe: async () => {
    const { token } = get();
    if (!token) { set({ user: null, triedMe: true }); return; }
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get("/auth/me", {
        withCredentials: true,
        skipAuthRedirect: true, // 👈 clave para no redirigir en 401 acá
      });
      set({ user: data.user ?? null, loading: false, triedMe: true });
    } catch {
      set({ user: null, loading: false, triedMe: true });
    }
  },

  login: async (body) => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.post("/auth/login", body, { withCredentials: true });
      const token = data?.token || data?.accessToken;
      if (token) get().setToken(token);
      await get().fetchMe();

      const u = get().user as any;
      if (u?.mustChangePassword) {
        if (typeof window !== "undefined") window.location.href = "/change-password?first=1";
        set({ loading: false });
        return true;
      }
      
      set({ loading: false });
      return true;
    } catch {
      set({ loading: false });
      return false;
    }
  },

  logout: () => {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    setAuthToken(null);
    set({ user: null, token: null });
    if (typeof window !== "undefined") window.location.href = "/login";
  },
}));
