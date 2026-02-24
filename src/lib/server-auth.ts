import { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function getBearer(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

export async function getServerMe(req: NextRequest) {
  const token = await getBearer(req);

  if (!token) return { user: null };
  try {
    const payload = await verifyJwt(token); // { uid, rid?, rname? }
    const user = await prisma.usuario.findUnique({
      where: { id: String(payload.uid) },
      select: {
        id: true,
        userId: true,
        email: true,
        nombre: true,
        apellido: true,
        avatarUrl: true,
        mustChangePassword: true,
        cuil: true, // 👈 está en Usuario
        rol: { select: { id: true, nombre: true } },
        legajo: {
          select: {
            numeroLegajo: true,
            estadoLaboral: true,
            tipoContrato: true,
            puesto: true,
            area: true,
            departamento: true,
          },
        },
      },
    });
    return { user };
  } catch {
    return { user: null };
  }
}

export async function requireAuth(req: NextRequest) {
  const me = await getServerMe(req);
  if (!me.user) throw new Error("UNAUTHORIZED");
  return me.user;
}
