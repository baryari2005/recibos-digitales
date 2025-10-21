// lib/payroll/registerReceipt.ts
import { createClient } from "@supabase/supabase-js";
import { upsertPayrollReceipt } from "@/lib/repos/payrollReceipts";

export async function registerReceipt(opts: {
  bucket: string;                // ej. "docs"
  pathInBucket: string;          // ej. "payroll/2025-08/20-23177200-7.pdf"
  cuilDashed: string;            // ej. "20-23177200-7"
  periodYYYYMM: string;          // ej. "2025-08"
  isBucketPublic?: boolean;      // default: true
}) {
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Si el bucket es público, sacamos la URL pública "estable".
  // Si es privado, podrías dejar fileUrl = "" (y firmar al leer).
  let fileUrl = "";
  if (opts.isBucketPublic ?? true) {
    const { data } = supa.storage.from(opts.bucket).getPublicUrl(opts.pathInBucket);
    fileUrl = data.publicUrl;
  }

  await upsertPayrollReceipt({
    cuilDashed: opts.cuilDashed,
    periodYYYYMM: opts.periodYYYYMM,
    filePath: opts.pathInBucket,
    fileUrl,
  });
}
