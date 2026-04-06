import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const types = await prisma.leaveTypeCatalog.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(types);
  } catch (error) {
    console.error("ERROR /api/leave-types:", error);

    return NextResponse.json(
      { error: "Error obteniendo tipos de licencia" },
      { status: 500 }
    );
  }
}