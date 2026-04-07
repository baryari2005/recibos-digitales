import { prisma } from "@/lib/db";
import { buildLeaveTypeWhere } from "../lib/leave-type.filters";

export async function listLeaveTypes(params: {
  q: string;
  activeOnly: boolean;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: "asc" | "desc";
}) {
  const { q, activeOnly, page, pageSize, sortBy, sortDir } = params;

  const where = buildLeaveTypeWhere(q, activeOnly);
  const total = await prisma.leaveTypeCatalog.count({ where });

  const items = await prisma.leaveTypeCatalog.findMany({
    where,
    include: {
      _count: {
        select: {
          requests: true,
        },
      },
    },
    orderBy: { [sortBy]: sortDir },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    meta: { total, page, pageSize, pageCount },
  };
}
