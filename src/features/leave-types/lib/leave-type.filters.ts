import { Prisma } from "@prisma/client";

type SortDir = "asc" | "desc";

const sortWhitelist = new Set([
  "id",
  "code",
  "label",
  "isActive",
  "createdAt",
]);

export function parseLeaveTypeListParams(url: string) {
  const { searchParams } = new URL(url);

  const q = (searchParams.get("q") || "").trim();
  const activeOnly = searchParams.get("activeOnly") === "1";

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10))
  );

  const rawSortBy = searchParams.get("sortBy") || "";
  const sortBy = sortWhitelist.has(rawSortBy) ? rawSortBy : "label";

  const sortDir: SortDir =
    (searchParams.get("sortDir") || "asc").toLowerCase() === "asc"
      ? "asc"
      : "desc";

  return { q, activeOnly, page, pageSize, sortBy, sortDir };
}

export function buildLeaveTypeWhere(
  q: string,
  activeOnly: boolean
): Prisma.LeaveTypeCatalogWhereInput {
  return {
    ...(activeOnly ? { isActive: true } : {}),
    ...(q
      ? {
          OR: [
            {
              code: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              label: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };
}
