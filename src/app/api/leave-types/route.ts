import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const types = await prisma.leaveTypeCatalog.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(types);
}
