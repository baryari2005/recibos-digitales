export function digitsOnly(value?: string | null): string {
  return (value ?? "").replace(/\D+/g, "");
}