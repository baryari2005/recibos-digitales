// src/app/api/holidays/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Resumen del shape de Nager.Date
type NagerHoliday = {
  date: string;      // "YYYY-MM-DD"
  localName: string; // nombre local en el país
  name: string;      // nombre en inglés
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year") ?? new Date().getFullYear().toString();
  const country = (searchParams.get("country") ?? "AR").toUpperCase();

  // Llamada a Nager.Date con revalidate 1 día
  const res = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`,
    { next: { revalidate: 60 * 60 * 24 } }
  );

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    return NextResponse.json({ error: "upstream_error", message: msg }, { status: 502 });
  }

  const data = (await res.json()) as NagerHoliday[];

  console.log(data);

  // Normalizamos: devolvemos { date, name }
  return NextResponse.json(
    data.map(h => ({
      date: h.date,                       // "YYYY-MM-DD"
      name: h.localName || h.name,        // preferí localName si existe
    }))
  );
}
