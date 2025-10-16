// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { getServerMe } from "@/lib/server-auth";
// import { legajoSchema, type LegajoValues } from "@/lib/validations/legajo.schema";

// /* --------------------------------------------------------
//  * Auth helper (solo admin)
//  * ------------------------------------------------------ */
// async function assertAdmin(req: NextRequest) {
//   const me = await getServerMe(req);
//   const role = me?.user?.rol?.nombre?.toLowerCase();
//   if (role !== "admin") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }
//   return null;
// }

// /* --------------------------------------------------------
//  * Fechas sin drift (UTC)                           (YYYY-MM-DD)
//  * ------------------------------------------------------ */
// const toYMD = (d: Date) => {
//   const y = d.getUTCFullYear();
//   const m = String(d.getUTCMonth() + 1).padStart(2, "0");
//   const day = String(d.getUTCDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// };

// const parseYMD = (s?: string | null) =>
//   s && s.trim() ? new Date(`${s}T00:00:00.000Z`) : null;

// /* --------------------------------------------------------
//  * Map DB -> DTO (lo que consume el form)
//  * ------------------------------------------------------ */
// function mapDbToDto(l: any): LegajoValues {
//   return {
//     employeeNumber: l.numeroLegajo ?? undefined,
//     documentType: l.tipoDocumento ?? undefined,
//     documentNumber: l.documento ?? "",
//     cuil: l.cuil ?? "",
//     admissionDate: l.fechaIngreso ? toYMD(l.fechaIngreso) : "",
//     terminationDate: l.fechaEgreso ? toYMD(l.fechaEgreso) : "",
//     employmentStatus: l.estadoLaboral ?? "ACTIVO",
//     contractType: l.tipoContrato ?? undefined,
//     position: l.puesto ?? "",
//     area: l.area ?? "",
//     department: l.departamento ?? "",
//     category: l.categoria ?? "",
//     notes: l.observaciones ?? "",
//   };
// }

// /* --------------------------------------------------------
//  * Map DTO -> DB (lo que guarda Prisma)
//  * ------------------------------------------------------ */
// function mapDtoToDb(dto: LegajoValues) {
//   return {
//     numeroLegajo: dto.employeeNumber ?? null,
//     tipoDocumento: dto.documentType ?? null,
//     documento: dto.documentNumber || null,
//     cuil: dto.cuil || null,
//     fechaIngreso: parseYMD(dto.admissionDate),
//     fechaEgreso: parseYMD(dto.terminationDate),
//     estadoLaboral: dto.employmentStatus,
//     tipoContrato: dto.contractType ?? null,
//     puesto: dto.position || null,
//     area: dto.area || null,
//     departamento: dto.department || null,
//     categoria: dto.category || null,
//     observaciones: dto.notes || null,
//   };
// }

// /* ========================================================
//  * GET /api/users/:id/legajo
//  * (⚠️ params debe esperarse)
//  * ====================================================== */
// export async function GET(
//   req: NextRequest,
//   ctx: { params: Promise<{ id: string }> }
// ) {
//   console.log("ENTRE");
//   const forbid = await assertAdmin(req);
//   if (forbid) return forbid;

//   const { id } = await ctx.params;

//   const legajo = await prisma.legajo.findUnique({ where: { usuarioId: id } });
//   if (!legajo) return NextResponse.json(null);

//   return NextResponse.json(mapDbToDto(legajo));
// }

// /* ========================================================
//  * POST /api/users/:id/legajo  (upsert)
//  * ====================================================== */
// export async function POST(
//   req: NextRequest,
//   ctx: { params: Promise<{ id: string }> }
// ) {
//   const forbid = await assertAdmin(req);
//   if (forbid) return forbid;

//   const { id } = await ctx.params;
//   const body = await req.json();

//   const dto = legajoSchema.parse(body);
//   const data = mapDtoToDb(dto);

//   const saved = await prisma.legajo.upsert({
//     where: { usuarioId: id },
//     update: data,
//     create: { usuarioId: id, ...data },
//   });

//   return NextResponse.json(mapDbToDto(saved));
// }

// /* ========================================================
//  * PATCH /api/users/:id/legajo (update parcial / upsert)
//  * ====================================================== */
// export async function PATCH(
//   req: NextRequest,
//   ctx: { params: Promise<{ id: string }> }
// ) {
//   const forbid = await assertAdmin(req);
//   if (forbid) return forbid;

//   const { id } = await ctx.params;
//   const body = await req.json();

//   const dto = legajoSchema.partial().parse(body);
//   const merged: LegajoValues = {
//     employmentStatus: "ACTIVO",
//     ...dto,
//   } as any;

//   const data = mapDtoToDb(merged);

//   const saved = await prisma.legajo.upsert({
//     where: { usuarioId: id },
//     update: data,
//     create: { usuarioId: id, ...data },
//   });

//   return NextResponse.json(mapDbToDto(saved));
// }
export {};