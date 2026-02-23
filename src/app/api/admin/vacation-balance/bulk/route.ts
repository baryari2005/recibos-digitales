// src/app/api/admin/vacation-balance/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/server-auth";
import { calcVacationDays } from "@/features/leaves/domain/calcVacationDays";

export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth(req);

        if (!["ADMIN", "RRHH", "ADMINISTRADOR"].includes(user.rol.nombre)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const year = new Date().getFullYear();
        //const BASE_DAYS = 14;

        // usuarios activos
        const users = await prisma.usuario.findMany({
            where: { deletedAt: null },
            select: { id: true, legajo: { select: { fechaIngreso: true, } } },
        });

        let created = 0;

        for (const u of users) {
            if (!u.legajo?.fechaIngreso) continue;

            const exists = await prisma.vacationBalance.findUnique({
                where: {
                    userId_year: {
                        userId: u.id,
                        year,
                    },
                },
            });

            if (exists) continue;

            const totalDays = calcVacationDays(
                new Date(u.legajo.fechaIngreso), year
            );

            await prisma.vacationBalance.create({
                data: {
                    userId: u.id,
                    year,
                    totalDays,
                    usedDays: 0,
                },
            });
            created++;

        }

        return NextResponse.json({
            ok: true,
            year,
            created,
        });
    } catch (e) {
        console.error("[VACATION_BULK_CREATE]", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
