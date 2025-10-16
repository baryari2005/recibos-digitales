import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    // query mínima
    await prisma.$queryRaw`SELECT 1`;
    const host = new URL(process.env.DATABASE_URL!).host; // ej: xxxx.pooler.supabase.com:6543
    return NextResponse.json({ ok: true, host });
  } catch (e) {
    console.error("HEALTH DB ERROR", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
