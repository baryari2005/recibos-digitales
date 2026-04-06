// app/api/quote-of-the-day/route.ts
import { NextResponse } from "next/server";

export const revalidate = 0;

type Quote = {
  text: string;
  author: string;
  provider: string;
};

type TranslationEngine = "none" | "libretranslate" | "mymemory";

type TranslationResult = {
  ok: boolean;
  out: string;
  engine: TranslationEngine;
  error?: string;
};

type QuotePayload = {
  text: string;
  author: string;
  provider: string;
  translated: boolean;
  debug?: {
    engine: TranslationEngine;
    error: string | null;
    libreUrlSet: boolean;
  };
};

type FavQsResponse = {
  quote?: {
    body?: string;
    author?: string;
  };
};

type QuotableItem = {
  content?: string;
  author?: string;
};

type ZenQuotesItem = {
  q?: string;
  a?: string;
};

type LibreTranslateResponse = {
  translatedText?: string;
};

type MyMemoryResponse = {
  responseData?: {
    translatedText?: string;
  };
};

async function fromFavQs(): Promise<Quote> {
  const r = await fetch("https://favqs.com/api/qotd", { cache: "no-store" });
  if (!r.ok) throw new Error("FavQs failed");

  const data: FavQsResponse = await r.json();

  return {
    text: data.quote?.body ?? "",
    author: data.quote?.author ?? "Anónimo",
    provider: "FavQs",
  };
}

async function fromQuotable(): Promise<Quote> {
  const r = await fetch("https://api.quotable.io/quotes/random?limit=1", {
    cache: "no-store",
  });
  if (!r.ok) throw new Error("Quotable failed");

  const data: QuotableItem | QuotableItem[] = await r.json();
  const q = Array.isArray(data) ? data[0] : data;

  return {
    text: q?.content ?? "",
    author: q?.author ?? "Unknown",
    provider: "Quotable",
  };
}

async function fromZenQuotes(): Promise<Quote> {
  const r = await fetch("https://zenquotes.io/api/today", {
    cache: "no-store",
  });
  if (!r.ok) throw new Error("ZenQuotes failed");

  const data: ZenQuotesItem | ZenQuotesItem[] = await r.json();
  const q = Array.isArray(data) ? data[0] : data;

  return {
    text: q?.q ?? "",
    author: q?.a ?? "Unknown",
    provider: "ZenQuotes",
  };
}

async function translateLibre(text: string): Promise<TranslationResult> {
  const LT_URL = process.env.LIBRE_TRANSLATE_URL;
  const LT_KEY = process.env.LIBRE_TRANSLATE_API_KEY;

  if (!LT_URL) {
    return {
      ok: false,
      out: text,
      engine: "none",
      error: "LIBRE_TRANSLATE_URL not set",
    };
  }

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

      return {
        ok: false,
        out: text,
        engine: "libretranslate",
        error: `HTTP ${r.status} ${body}`,
      };
    }

    const data: LibreTranslateResponse = await r.json();
    const out = data.translatedText || text;

    return {
      ok: out !== text,
      out,
      engine: "libretranslate",
    };
  } catch (error: unknown) {
    return {
      ok: false,
      out: text,
      engine: "libretranslate",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function translateMyMemory(text: string): Promise<TranslationResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const u = new URL("https://api.mymemory.translated.net/get");
    u.searchParams.set("q", text);
    u.searchParams.set("langpair", "en|es");

    const r = await fetch(u.toString(), {
      signal: controller.signal,
      headers: { "User-Agent": "dashboard-rbac/1.0" },
    });

    if (!r.ok) {
      return {
        ok: false,
        out: text,
        engine: "mymemory",
        error: `HTTP ${r.status}`,
      };
    }

    const data: MyMemoryResponse = await r.json();
    const out = data.responseData?.translatedText || text;

    return {
      ok: Boolean(out && out !== text),
      out,
      engine: "mymemory",
    };
  } catch (error: unknown) {
    return {
      ok: false,
      out: text,
      engine: "mymemory",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const debug = url.searchParams.get("debug") === "1";

  const sources = [fromQuotable, fromZenQuotes, fromFavQs];
  let quote: Quote | null = null;

  for (const fn of sources) {
    try {
      const q = await fn();
      if (q.text) {
        quote = q;
        break;
      }
    } catch {
      // noop
    }
  }

  if (!quote) {
    return NextResponse.json({ error: "No quote available" }, { status: 502 });
  }

  const t1 = await translateLibre(quote.text);

  let out = t1.out;
  let engine: TranslationEngine = t1.engine;
  let translated = t1.ok;
  let err = t1.error;

  if (!translated) {
    const t2 = await translateMyMemory(quote.text);
    out = t2.out;
    engine = t2.engine;
    translated = t2.ok || translated;
    err = err ?? t2.error;
  }

  const payload: QuotePayload = {
    text: out,
    author: quote.author,
    provider: quote.provider,
    translated,
  };

  if (debug) {
    payload.debug = {
      engine,
      error: err ?? null,
      libreUrlSet: Boolean(process.env.LIBRE_TRANSLATE_URL),
    };
  }

  return NextResponse.json(payload, { status: 200 });
}