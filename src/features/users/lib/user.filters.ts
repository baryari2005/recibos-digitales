import { Prisma } from "@prisma/client";

const sortWhitelist = new Set([
  "userId",
  "email",
  "nombre",
  "apellido",
  "createdAt",
]);

type SortDir = "asc" | "desc";

export function parseUserListParams(url: string) {
  const { searchParams } = new URL(url);

  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10))
  );

  const rawSortBy = searchParams.get("sortBy") || "";
  const sortBy = sortWhitelist.has(rawSortBy) ? rawSortBy : "createdAt";

  const sortDir: SortDir =
    (searchParams.get("sortDir") || "desc").toLowerCase() === "asc"
      ? "asc"
      : "desc";

  return { q, page, pageSize, sortBy, sortDir };
}

export function buildUserWhere(q: string): Prisma.UsuarioWhereInput {
  return {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { userId: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { nombre: { contains: q, mode: "insensitive" } },
            { apellido: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}