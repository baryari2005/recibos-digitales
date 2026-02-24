import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerMe } from "@/lib/server-auth";

type AuthOk = { ok: true; me: any };
type AuthFail = { ok: false; res: NextResponse };
type AuthResult = AuthOk | AuthFail;

function maskAuthHeader(h?: string | null) {
  if (!h) return "none";
  if (h.length <= 14) return h;
  return `${h.slice(0, 10)}…${h.slice(-4)}`;
}

const norm = (v?: string | null) => (v ?? "").trim().toUpperCase();

// 👇 ajustá estos ids según tu tabla
const ADMIN_ROLE_IDS = new Set<number>([2, 4]); // ADMINISTRADOR y admin
const ADMIN_ROLE_NAMES = new Set<string>(["ADMIN", "ADMINISTRADOR", "RRHH"]);

export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
  const authz = req.headers.get("authorization");
  console.log("[authz] path:", req.nextUrl.pathname);
  console.log("[authz] Authorization header:", maskAuthHeader(authz));

  try {
    const me = await getServerMe(req);

    const user = me?.user;
    const userId = user?.id;

    const roleId = Number(user?.rol?.id ?? 0);       // 👈 ID numérico (2,4,...)
    const roleName = norm(user?.rol?.nombre);        // 👈 "ADMINISTRADOR", "ADMIN", etc.

    console.log(
      "[authz] getServerMe -> user?",
      !!user,
      "userId:",
      userId,
      "roleId:",
      roleId,
      "roleName:",
      roleName
    );

    if (!user) {
      return {
        ok: false,
        res: NextResponse.json(
          { error: "UNAUTHORIZED", reason: "missing_or_invalid_token" },
          { status: 401, headers: { "WWW-Authenticate": "Bearer" } }
        ),
      };
    }

    const isAdmin = ADMIN_ROLE_IDS.has(roleId) || ADMIN_ROLE_NAMES.has(roleName);

    if (!isAdmin) {
      return {
        ok: false,
        res: NextResponse.json(
          { error: "FORBIDDEN", reason: "role_not_allowed", roleId, roleName },
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