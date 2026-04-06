"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getMe, postLogin } from "@/features/auth/libs/auth-api";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/features/auth/libs/auth-session";
import type {
  LoginBody,
  UserDTO,
} from "@/features/auth/types/auth.types";

type State = {
  user: UserDTO | null;
  token: string | null;
  loading: boolean;
  triedMe: boolean;
  hasHydrated: boolean;
};

type Actions = {
  setToken: (token: string | null) => void;
  setUser: (user: UserDTO | null) => void;
  setHasHydrated: (value: boolean) => void;
  fetchMe: (force?: boolean) => Promise<void>;
  login: (body: LoginBody) => Promise<boolean>;
  logout: (redirectTo?: string) => void;
};

let mePromise: Promise<void> | null = null;
let mePromiseToken: string | null = null;

export const useAuth = create<State & Actions>()(
  persist(
    (set, get) => ({
      user: null,
      token: typeof window !== "undefined" ? getStoredToken() : null,
      loading: false,
      triedMe: false,
      hasHydrated: false,

      setToken: (token) => {
        setStoredToken(token);

        set((state) => ({
          token,
          user: token ? state.user : null,
          triedMe: token ? state.triedMe : true,
        }));
      },

      setUser: (user) => {
        set({ user });
      },

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      fetchMe: async (force = false) => {
        const { token, triedMe, user, loading } = get();

        if (!token) {
          set({
            user: null,
            token: null,
            loading: false,
            triedMe: true,
          });
          return;
        }

        if (!force && triedMe && !!user) {
          return;
        }

        if (!force && loading && mePromise) {
          return mePromise;
        }

        if (!force && mePromise && mePromiseToken === token) {
          return mePromise;
        }

        set({ loading: true });
        mePromiseToken = token;

        mePromise = getMe()
          .then((data) => {
            set({
              user: data.user ?? null,
              loading: false,
              triedMe: true,
            });
          })
          .catch(() => {
            clearStoredToken();
            set({
              user: null,
              token: null,
              loading: false,
              triedMe: true,
            });
          })
          .finally(() => {
            mePromise = null;
            mePromiseToken = null;
          });

        return mePromise;
      },

      login: async (body) => {
        set({ loading: true });

        try {
          const data = await postLogin(body);
          const token = data.token ?? data.accessToken ?? null;

          if (!token) {
            set({
              user: null,
              token: null,
              loading: false,
              triedMe: true,
            });
            return false;
          }

          get().setToken(token);
          await get().fetchMe(true);

          const user = get().user;

          if (!user) {
            set({ loading: false });
            return false;
          }

          if (user.mustChangePassword) {
            set({ loading: false });

            if (typeof window !== "undefined") {
              window.location.replace("/change-password?first=1");
            }

            return true;
          }

          set({ loading: false });
          return true;
        } catch {
          clearStoredToken();
          set({
            user: null,
            token: null,
            loading: false,
            triedMe: true,
          });
          return false;
        }
      },

      logout: (redirectTo = "/login") => {
        clearStoredToken();
        set({
          user: null,
          token: null,
          loading: false,
          triedMe: true,
        });

        if (typeof window !== "undefined") {
          window.location.replace(redirectTo);
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        const token = getStoredToken();
        setStoredToken(token);

        state.setHasHydrated(true);

        if (!token) {
          state.setUser(null);
        }
      },
    }
  )
);