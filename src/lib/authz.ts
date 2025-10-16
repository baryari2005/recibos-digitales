import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerMe } from "@/lib/server-auth";

type AuthOk = { ok: true; me: any };
type AuthFail = { ok: false; res: NextResponse };
type AuthResult = AuthOk | AuthFail;

function maskAuthHeader(h?: string | null) {
  if (!h) return "none";
  // no imprimimos el token completo
  if (h.length <= 14) return h;
  return `${h.slice(0, 10)}…${h.slice(-4)}`;
}

export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
  const authz = req.headers.get("authorization");
  console.log("[authz] path:", req.nextUrl.pathname);
  console.log("[authz] Authorization header:", maskAuthHeader(authz));

  try {
    const me = await getServerMe(req);
    const userId = me?.user?.id;
    const roleName = me?.user?.rol?.nombre?.toLowerCase();

    console.log("[authz] getServerMe -> user?", !!me?.user, "userId:", userId, "role:", roleName);

    if (!me?.user) {
      return {
        ok: false,
        res: NextResponse.json(
          { error: "UNAUTHORIZED", reason: "missing_or_invalid_token" },
          { status: 401, headers: { "WWW-Authenticate": "Bearer" } }
        ),
      };
    }

    if (roleName !== "admin") {
      return {
        ok: false,
        res: NextResponse.json(
          { error: "FORBIDDEN", reason: "role_not_allowed", role: roleName },
          { status: 403 }
        ),
      };
    }

    return { ok: true, me };
  } catch (e: any) {
    console.error("[authz] getServerMe error:", e?.message || e);
    return {
      ok: false,
      res: NextResponse.json(
        { error: "UNAUTHORIZED", reason: "token_verification_failed" },
        { status: 401, headers: { "WWW-Authenticate": "Bearer" } }
      ),
    };
  }
}
