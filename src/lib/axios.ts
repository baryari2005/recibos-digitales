import axios, { AxiosRequestConfig } from "axios";

type AxiosRequestConfigExt = AxiosRequestConfig & { skipAuthRedirect?: boolean };

const baseURL = "/api"; // 👈 usar Next API Routes

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null) {
  inMemoryToken = token;

  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }

  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}

if (typeof window !== "undefined") {
  const t = localStorage.getItem("token");
  if (t) setAuthToken(t);
}

function maskAuthHeader(headers: any) {
  if (!headers) return headers;
  const clone = { ...headers };
  const authKey = Object.keys(clone).find((k) => k.toLowerCase() === "authorization");
  if (authKey && typeof clone[authKey] === "string") clone[authKey] = "Bearer ***";
  return clone;
}
function buildFullUrl(config: AxiosRequestConfig) {
  const url = config.url ?? "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = (config.baseURL ?? "").replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}
function isLoginCall(url = "") {
  try {
    const u = url.startsWith("http") ? new URL(url) : new URL(url, "http://x");
    return u.pathname.endsWith("/auth/login");
  } catch {
    return url.endsWith("/auth/login");
  }
}

axiosInstance.interceptors.request.use((config) => {
  const token = inMemoryToken ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  const full = buildFullUrl(config);
  let qs = "";
  if (config.params && typeof config.params === "object") {
    try { qs = `?${new URLSearchParams(config.params as any).toString()}`; } catch {}
  }
  console.log("[AXIOS][REQUEST]", full + qs, {
    method: config.method,
    headers: maskAuthHeader(config.headers),
  });

  return config;
});

// axiosInstance.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const status = err?.response?.status;
//     const cfg = (err?.config ?? {}) as AxiosRequestConfigExt;
//     const reqUrl: string = cfg?.url || "";

//     if (cfg?.skipAuthRedirect) {
//       return Promise.reject(err);
//     }

//     if (typeof window !== "undefined") {
//       const isOnLogin = window.location.pathname === "/login";
//       const loginCall = isLoginCall(reqUrl);
//       if (status === 401 && !isOnLogin && !loginCall) {
//         const here = window.location.pathname + window.location.search;
//         const next = encodeURIComponent(here);
//         const dest = `/login?next=${next}`;
//         if (window.location.href !== dest) window.location.replace(dest);
//         return new Promise(() => {}); // corta cadenas
//       }
//     }

//     return Promise.reject(err);
//   }
// );

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const cfg = (err?.config ?? {}) as AxiosRequestConfigExt;
    const reqUrl: string = cfg?.url || "";

    if (cfg?.skipAuthRedirect) {
      return Promise.reject(err);
    }

    if (typeof window !== "undefined") {
      const isOnLogin = window.location.pathname === "/login";
      const loginCall = isLoginCall(reqUrl);

      if (status === 401 && !isOnLogin && !loginCall) {
        console.warn("[AUTH] 401 detectado → logout");

        // 🔥 1. limpiar token
        setAuthToken(null);

        // 🔔 2. avisar a toda la app
        window.dispatchEvent(new Event("auth:logout"));

        // 🔀 3. redirigir
        const here = window.location.pathname + window.location.search;
        const next = encodeURIComponent(here);
        window.location.replace(`/login?next=${next}`);

        // ⛔ cortar promesas
        return new Promise(() => {});
      }
    }

    return Promise.reject(err);
  }
);