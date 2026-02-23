import { PrismaClient, LeaveType } from "@prisma/client";

export async function seedLeaveTypes(prisma: PrismaClient) {
  const CATALOG: {
    code: LeaveType;
    label: string;
    colorHex?: string;
  }[] = [
    { code: LeaveType.VACACIONES, label: "Vacaciones", colorHex: "#4F46E5" },
    { code: LeaveType.ENFERMEDAD, label: "Enfermedad", colorHex: "#EF4444" },
    { code: LeaveType.CASAMIENTO, label: "Casamiento" },
    { code: LeaveType.ESTUDIOS, label: "Estudios" },
    { code: LeaveType.EXCEDENCIA, label: "Excedencia" },
    { code: LeaveType.FALLECIMIENTO, label: "Fallecimiento" },
    { code: LeaveType.CON_GOCE, label: "Licencia con goce" },
    { code: LeaveType.SIN_GOCE, label: "Licencia sin goce" },
    { code: LeaveType.MATERNIDAD, label: "Maternidad" },
    { code: LeaveType.NACIMIENTO, label: "Nacimiento de hijo/a" },
    { code: LeaveType.SEMANA_EXTRA, label: "Semana extra" },
  ];

  for (const item of CATALOG) {
    await prisma.leaveTypeCatalog.upsert({
      where: { code: item.code },
      update: {
        label: item.label,
        colorHex: item.colorHex,
        isActive: true,
      },
      create: {
        code: item.code,
        label: item.label,
        colorHex: item.colorHex,
      },
    });
  }

  console.log("✅ Leave types seeded");
}
