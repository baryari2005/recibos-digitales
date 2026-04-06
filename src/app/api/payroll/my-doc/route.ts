import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerMe } from "@/lib/server-auth";
import { cuilDashed, cuilDigits } from "@/lib/cuil";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServerMeUser = {
  id?: string | null;
  cuil?: string | null;
  cuilNumero?: string | null;
};

function getSafeUser(value: unknown): ServerMeUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (!("user" in value)) {
    return null;
  }

  const user = (value as { user?: unknown }).user;

  if (!user || typeof user !== "object") {
    return null;
  }

  const candidate = user as Record<string, unknown>;

  return {
    id: typeof candidate.id === "string" ? candidate.id : null,
    cuil: typeof candidate.cuil === "string" ? candidate.cuil : null,
    cuilNumero:
      typeof candidate.cuilNumero === "string"
        ? candidate.cuilNumero
        : null,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || new Date().toISOString().slice(0, 7);

  const me = await getServerMe(req);
  const user = getSafeUser(me);
  
  const userId = me?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

   const rawCuil = user?.cuil || user?.cuilNumero;
  if (!rawCuil) {
    return NextResponse.json({ error: "CUIL no configurado en tu perfil." }, { status: 400 });
  }


  const cuilDigit = cuilDigits(rawCuil);
  const cuilDash = cuilDashed(rawCuil);


  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const bucket = process.env.SUPABASE_BUCKET || "docs";

  // 👇 variantes a probar según tu estructura actual y la “esperada”
  const candidates = [
    // tu estructura actual (según screenshot):
    `${period}/payroll/${period}/${cuilDash}.pdf`,
    `${period}/payroll/${period}/${cuilDigit}.pdf`,
    // la ruta “esperada” original:
    `payroll/${period}/${cuilDash}.pdf`,
    `payroll/${period}/${cuilDigit}.pdf`,
    // por si subís directamente en el nivel 2025-08/<cuil>.pdf
    `${period}/${cuilDash}.pdf`,
    `${period}/${cuilDigit}.pdf`,
  ];


  console.log("[cuilDash]", cuilDash);
  console.log("[cuilDigits]", cuilDigit);

  for (const path of candidates) {
    const { data, error } = await supa.storage.from(bucket).createSignedUrl(path, 3600);
    if (!error && data?.signedUrl) {
      // encontrado
      return NextResponse.json({ url: data.signedUrl, period, pathUsed: path });
    }
  }

  return NextResponse.json(
    { error: "Not found", period, bucket, tried: candidates },
    { status: 404 }
  );
}
