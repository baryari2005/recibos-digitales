// src/app/api/holidays/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NagerHoliday = { date: string; localName: string; name: string };
type ArDato = { fecha: string; nombre: string; tipo: "inamovible"|"trasladable"|"puente" };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year") ?? new Date().getFullYear().toString();
  const country = (searchParams.get("country") ?? "AR").toUpperCase();

  try {
    if (country === "AR") {
      const r = await fetch(`https://api.argentinadatos.com/v1/feriados/${year}`, { next: { revalidate: 86400 } });
      if (!r.ok) throw new Error(await r.text());
      const data = (await r.json()) as ArDato[];
      return NextResponse.json(
        data.map(d => ({ date: d.fecha, name: d.nombre, type: d.tipo }))
      );
    }

    // resto de países (Nager)
    const r = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`, { next: { revalidate: 86400 } });
    if (!r.ok) throw new Error(await r.text());
    const data = (await r.json()) as NagerHoliday[];
    return NextResponse.json(
      data.map(h => ({ date: h.date, name: h.localName || h.name }))
    );

  } catch (e: any) {
    return NextResponse.json({ error: "upstream_error", message: String(e?.message ?? e) }, { status: 502 });
  }
}
