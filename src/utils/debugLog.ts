export function dbg(scope: string, ...args: any[]) {
  const ts = new Date().toISOString().split("T")[1].replace("Z", "");
  // @ts-ignore
  if (typeof window !== "undefined") console.log(`[${ts}] ${scope}:`, ...args);
}