export const STORAGE_KEY = "loginFormDraft";
export const ERROR_KEY = "loginFormError";

export function readDraft<T>(fallback: T): T {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") ?? fallback; } catch { return fallback; }
}
export function writeDraft<T>(vals: T) { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(vals)); } catch {} }
export function clearDraft() { try { sessionStorage.removeItem(STORAGE_KEY); } catch {} }

export function readTopError(): string | null { try { return sessionStorage.getItem(ERROR_KEY); } catch { return null; } }
export function writeTopError(msg: string) { try { sessionStorage.setItem(ERROR_KEY, msg); } catch {} }
export function clearTopError() { try { sessionStorage.removeItem(ERROR_KEY); } catch {} }
