import { axiosInstance } from "@/lib/axios";

const TOKEN_KEY = "token";

let inMemoryToken: string | null = null;

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return inMemoryToken;
  }

  return inMemoryToken ?? localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  inMemoryToken = token;

  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}

export function clearStoredToken() {
  setStoredToken(null);
}