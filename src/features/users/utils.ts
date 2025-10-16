// src/features/users/utils.ts
export const normalize = (v?: string) => (v?.trim() ? v.trim() : undefined);

export function pathFromPublicUrl(url?: string | null) {
  if (!url) return null;
  // https://<proj>.supabase.co/storage/v1/object/public/avatars/users/123/abc.png → users/123/abc.png
  const m = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
  return m?.[1] ?? null;
}
