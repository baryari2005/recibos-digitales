export function initials(name?: string | null, fallback?: string) {
  if (!name && !fallback) return "U";
  const base = (name || fallback || "").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
