import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeaveRepository } from "@/features/leaves/infrastructure/leave.prisma-repository";
import { CreateLeaveUseCase } from "@/features/leaves/application/create-leave.usecase";
import { getServerMe, requireAuth } from "@/lib/server-auth";
import { LeaveStatus, Prisma } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const VACATION_TYPE_CODE = "VACACIONES";

type AttachmentInput = {
  fileName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  size: number;
};

async function getUserId(req: NextRequest): Promise<string> {
  const me = await getServerMe(req);

  if (!me?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return me.user.id;
}

function enumMatches<T extends object>(enm: T, q: string) {
  return Object.values(enm).filter((v) => v.toString().includes(q));
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const typeParam = searchParams.get("type");

    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const q = (searchParams.get("q") ?? "").toUpperCase();

    const statusMatches = q ? enumMatches(LeaveStatus, q) : [];

    const andFilters: Prisma.LeaveRequestWhereInput[] = [{ userId: user.id }];

    if (typeParam === "VACACIONES") {
      andFilters.push({
        typeCatalog: {
          is: {
            code: VACATION_TYPE_CODE,
          },
        },
      });
    }

    if (typeParam === "OTHER") {
      andFilters.push({
        typeCatalog: {
          isNot: {
            code: VACATION_TYPE_CODE,
          },
        },
      });
    }

    if (q) {
      const orFilters: Prisma.LeaveRequestWhereInput[] = [
        ...(statusMatches.length ? [{ status: { in: statusMatches } }] : []),
        {
          typeCatalog: {
            is: {
              OR: [
                { code: { contains: q, mode: "insensitive" } },
                { label: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ];

      if (orFilters.length) {
        andFilters.push({
          OR: orFilters,
        });
      }
    }

    const where: Prisma.LeaveRequestWhereInput = {
      AND: andFilters,
    };

    const [items, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          attachments: true,
          typeCatalog: {
            select: {
              code: true,
              label: true,
            },
          },
        },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return NextResponse.json({
      data: items.map((item) => ({
        ...item,
        type: item.typeCatalog.label,
        typeCode: item.typeCatalog.code,
        attachments: item.attachments ?? [],
      })),
      meta: {
        total,
        page,
        pageCount: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/leaves error:", error);

    return NextResponse.json(
      { error: "Error obteniendo licencias" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    const contentType = req.headers.get("content-type") || "";

    let body: any = {};
    const attachments: AttachmentInput[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      body = {
        type: form.get("type"),
        startYmd: form.get("startYmd"),
        endYmd: form.get("endYmd"),
        daysCount: Number(form.get("daysCount")),
        note: form.get("note"),
      };

      const files = form.getAll("files") as File[];

      if (files.length > 0) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const bucket = process.env.SUPABASE_BUCKET || "docs";

        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const objectPath = `licenses/${Date.now()}-${safeName}`;

          const { error } = await supabase.storage
            .from(bucket)
            .upload(objectPath, buffer, {
              contentType: file.type,
            });

          if (error) {
            throw new Error(error.message);
          }

          const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(objectPath);

          attachments.push({
            fileName: file.name,
            fileUrl: data.publicUrl,
            filePath: objectPath,
            mimeType: file.type,
            size: file.size,
          });
        }
      }
    } else {
      body = await req.json();
    }

    const repo = new LeaveRepository(prisma);
    const uc = new CreateLeaveUseCase(repo);

    const payload = {
      ...body,
      attachments,
    } as Parameters<CreateLeaveUseCase["execute"]>[1];

    const data = await uc.execute(userId, payload);

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (error.message === "INSUFFICIENT_VACATION_BALANCE") {
        return NextResponse.json(
          { error: "No tenés días suficientes de vacaciones" },
          { status: 400 }
        );
      }

      if (error.message === "PENDING_VACATION_EXISTS") {
        return NextResponse.json(
          {
            error: "Ya tenés una solicitud pendiente",
            code: "PENDING_VACATION_EXISTS",
          },
          { status: 409 }
        );
      }

      if (error.message === "VACATION_DATE_OVERLAP") {
        return NextResponse.json(
          {
            error: "Las fechas se superponen",
            code: "VACATION_DATE_OVERLAP",
          },
          { status: 409 }
        );
      }

      console.error("POST /api/leaves error:", error);

      return NextResponse.json(
        { error: error.message || "Error inesperado" },
        { status: 500 }
      );
    }

    console.error("POST /api/leaves unknown error:", error);

    return NextResponse.json(
      { error: "Error inesperado" },
      { status: 500 }
    );
  }
}
