export function normalizeLeaveTypeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "_");
}