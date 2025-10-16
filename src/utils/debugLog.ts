// src/utils/debugLog.ts
export function dbg(scope: string, ...args: unknown[]) {
  // solo loguea en desarrollo
  if (process.env.NODE_ENV === "production") return;

  const ts = new Date().toISOString().split("T")[1]?.replace("Z", "") ?? "";

  // evita depender de tipos DOM: chequea "window" vía globalThis
  const isBrowser =
    typeof globalThis === "object" &&
    "window" in (globalThis as Record<string, unknown>) &&
    (globalThis as Record<string, unknown>).window === globalThis;

  if (isBrowser) {
    // eslint-disable-next-line no-console
    console.log(`[${ts}] ${scope}:`, ...args);
  }
}