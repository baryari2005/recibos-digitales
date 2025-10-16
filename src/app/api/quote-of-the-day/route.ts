// app/api/quote-of-the-day/route.ts
import { NextResponse } from "next/server";

// Mientras probás, sin cache (luego podés subir a 86400)
export const revalidate = 0;

type Quote = { text: string; author: string; provider: string };

async function fromFavQs(): Promise<Quote> {
  const r = await fetch("https://favqs.com/api/qotd", { cache: "no-store" });
  if (!r.ok) throw new Error("FavQs failed");
  const data = await r.json();
  return { text: data?.quote?.body ?? "", author: data?.quote?.author ?? "Anónimo", provider: "FavQs" };
}
async function fromQuotable(): Promise<Quote> {
  const r = await fetch("https://api.quotable.io/quotes/random?limit=1", { cache: "no-store" });
  if (!r.ok) throw new Error("Quotable failed");
  const arr = await r.json();
  const q = Array.isArray(arr) ? arr[0] : arr;
  return { text: q?.content ?? "", author: q?.author ?? "Unknown", provider: "Quotable" };
}
async function fromZenQuotes(): Promise<Quote> {
  const r = await fetch("https://zenquotes.io/api/today", { cache: "no-store" });
  if (!r.ok) throw new Error("ZenQuotes failed");
  const arr = await r.json();
  const q = Array.isArray(arr) ? arr[0] : arr;
  return { text: q?.q ?? "", author: q?.a ?? "Unknown", provider: "ZenQuotes" };
}

async function translateLibre(text: string) {
  const LT_URL = process.env.LIBRE_TRANSLATE_URL;
  const LT_KEY = process.env.LIBRE_TRANSLATE_API_KEY;
  if (!LT_URL) return { ok: false, out: text, engine: "none", error: "LIBRE_TRANSLATE_URL not set" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const url = `${LT_URL.replace(/\/$/, "")}/translate`;
    const r = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: "es",
        format: "text",
        ...(LT_KEY ? { api_key: LT_KEY } : {}),
      }),
    });
    if (!r.ok) {
      const body = await r.text();
      return { ok: false, out: text, engine: "libretranslate", error: `HTTP ${r.status} ${body}` };
    }
    const data = await r.json();
    const out = data?.translatedText || text;
    return { ok: out !== text, out, engine: "libretranslate" as const };
  } catch (e: any) {
    return { ok: false, out: text, engine: "libretranslate", error: e?.message ?? "error" };
  } finally {
    clearTimeout(timeout);
  }
}

async function translateMyMemory(text: string) {
  // Fallback gratuito
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const u = new URL("https://api.mymemory.translated.net/get");
    u.searchParams.set("q", text);
    u.searchParams.set("langpair", "en|es");
    const r = await fetch(u.toString(), { signal: controller.signal, headers: { "User-Agent": "dashboard-rbac/1.0" } });
    if (!r.ok) return { ok: false, out: text, engine: "mymemory", error: `HTTP ${r.status}` };
    const data = await r.json();
    const out = data?.responseData?.translatedText || text;
    return { ok: out && out !== text, out, engine: "mymemory" as const };
  } catch (e: any) {
    return { ok: false, out: text, engine: "mymemory", error: e?.message ?? "error" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const debug = url.searchParams.get("debug") === "1";

  // 1) obtener la frase (con fallback)
  const sources = [ fromQuotable, fromZenQuotes, fromFavQs];
  let quote: Quote | null = null;
  for (const fn of sources) {
    try {
      const q = await fn();
      if (q?.text) { quote = q; break; }
    } catch {}
  }
  if (!quote) {
    return NextResponse.json({ error: "No quote available" }, { status: 502 });
  }

  // 2) traducir: LibreTranslate → MyMemory
  const t1 = await translateLibre(quote.text);
  let out = t1.out, engine = t1.engine, translated = t1.ok, err = t1.error;

  if (!translated) {
    const t2 = await translateMyMemory(quote.text);
    out = t2.out; engine = t2.engine; translated = t2.ok || translated; err = err ?? t2.error;
  }

  // 3) responder
  const payload: any = {
    text: out,
    author: quote.author,
    provider: quote.provider,
    translated,
  };
  if (debug) {
    payload.debug = { engine, error: err ?? null, libreUrlSet: !!process.env.LIBRE_TRANSLATE_URL };
  }
  return NextResponse.json(payload, { status: 200 });
}
