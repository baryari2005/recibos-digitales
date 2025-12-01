// // prisma/seed.leave-types.ts
// import { PrismaClient, Prisma } from "@prisma/client"; // 👈 trae Prisma (enums)
// const prisma = new PrismaClient();

// const CATALOG: { code: Prisma.LeaveType; label: string; colorHex?: string }[] = [
//   { code: "VACACIONES",   label: "Vacaciones",   colorHex: "#4F46E5" },
//   { code: "ENFERMEDAD",   label: "Enfermedad",   colorHex: "#EF4444" },
//   { code: "CASAMIENTO",   label: "Casamiento" },
//   { code: "ESTUDIOS",     label: "Estudios" },
//   { code: "EXCEDENCIA",   label: "Excedencia" },
//   { code: "FALLECIMIENTO",label: "Fallecimiento" },
//   { code: "CON_GOCE",     label: "Licencia con goce" },
//   { code: "SIN_GOCE",     label: "Licencia sin goce" },
//   { code: "MATERNIDAD",   label: "Maternidad" },
//   { code: "NACIMIENTO",   label: "Nacimiento de hijo/a" },
//   { code: "SEMANA_EXTRA", label: "Semana extra" },
// ];

// async function main() {
//   for (const item of CATALOG) {
//     await prisma.leaveTypeCatalog.upsert({
//       where: { code: item.code },           // code es unique
//       update: { label: item.label, colorHex: item.colorHex, isActive: true },
//       create: { code: item.code, label: item.label, colorHex: item.colorHex },
//     });
//   }
// }

// main()
//   .then(() => prisma.$disconnect())
//   .catch((e) => { console.error(e); return prisma.$disconnect(); });
