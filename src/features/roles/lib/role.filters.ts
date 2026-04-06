import { Prisma } from "@prisma/client";

type SortDir = "asc" | "desc";

const sortWhitelist = new Set([
  "id",
  "nombre",
  "descripcion",
  "activo",
  "createdAt",
]);

export function parseRoleListParams(url: string) {
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

export function buildRoleWhere(q: string): Prisma.RolWhereInput {
  if (!q) return {};

  return {
    OR: [
      {
        nombre: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        descripcion: {
          contains: q,
          mode: "insensitive",
        },
      },
    ],
  };
}