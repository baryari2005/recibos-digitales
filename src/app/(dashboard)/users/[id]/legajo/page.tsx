// src/app/(dashboard)/users/[id]/legajo/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LegajoForm } from "@/components/users/LegajoForm";
import { getUser, getUserPersonnelFile, upsertUserPersonnelFile } from "@/lib/api/users";
import { toast } from "sonner";
import { RoleGate } from "@/components/auth/RoleGate";
import { CenteredSpinner } from "@/components/CenteredSpinner";
import { Asterisk, FileUser } from "lucide-react";

// 👇 importamos tipos y unions “oficiales” del schema del form
import type { LegajoValues } from "@/features/users/legajo.schema";
import { EMPLOYMENT_STATUS, CONTRACT_TYPES } from "@/features/users/legajo.schema";

export default function UserLegajoPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <RoleGate allowIds={[2]} mode="render">
      <LegajoContent id={id} />
    </RoleGate>
  );
}

// 👇 Adaptador: API -> shape esperado por el form (Literal unions + defaults)
function normalizePersonnelFile(pf: any): Partial<LegajoValues> {
  const isEmployment = (s: any): s is LegajoValues["employmentStatus"] =>
    typeof s === "string" && (EMPLOYMENT_STATUS as readonly string[]).includes(s);

  const isContract = (s: any): s is NonNullable<LegajoValues["contractType"]> =>
    typeof s === "string" && (CONTRACT_TYPES as readonly string[]).includes(s);

  return {
    employeeNumber: pf?.employeeNumber ?? undefined,
    admissionDate: pf?.admissionDate ?? null,
    terminationDate: pf?.terminationDate ?? null,
    employmentStatus: isEmployment(pf?.employmentStatus) ? pf.employmentStatus : "ACTIVO",
    contractType: isContract(pf?.contractType) ? pf.contractType : undefined,
    position: pf?.position ?? "",
    area: pf?.area ?? "",
    department: pf?.department ?? "",
    category: pf?.category ?? "",
    matriculaProvincial: pf?.matriculaProvincial ?? "",
    matriculaNacional: pf?.matriculaNacional ?? "",
    notes: pf?.notes ?? "",
  };
}

function LegajoContent({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [initial, setInitial] = useState<Partial<LegajoValues> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [u, f] = await Promise.all([getUser(id), getUserPersonnelFile(id)]);
      if (!mounted) return;

      setUserName([u?.firstName, u?.lastName].filter(Boolean).join(" ") || u.userId);

      // 👇 normalizamos lo que venga del API para que cumpla el tipo del form
      const normalized: Partial<LegajoValues> =
        f ? normalizePersonnelFile(f) : { employmentStatus: "ACTIVO" };

      setInitial(normalized);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading || !initial) return <CenteredSpinner label="Cargando..." />;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <FileUser className="mr-2" />
            Cargar Legajo <Asterisk className="ml-4 w-4 h-4" /> {userName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LegajoForm
            defaultValues={initial}
            onSubmit={async (values) => {
              // si tu cliente tipa distinto, casteá acá o alinea el tipo del cliente con LegajoValues
              await upsertUserPersonnelFile(id, values as any);
              toast.success("Guardado");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
