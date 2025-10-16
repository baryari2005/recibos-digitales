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

export default function UserLegajoPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <RoleGate allow={["admin"]} mode="render">
      <LegajoContent id={id} />
    </RoleGate>
  );
}

function LegajoContent({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [initial, setInitial] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const [u, f] = await Promise.all([getUser(id), getUserPersonnelFile(id)]);
      if (!mounted) return;
      setUserName([u?.firstName, u?.lastName].filter(Boolean).join(" ") || u.userId);
      setInitial(f ?? { estadoLaboral: "ACTIVO" });
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <CenteredSpinner label="Cargando..." />;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <FileUser className="mr-2" />Cargar Legajo <Asterisk className="ml-4 w-4 h-4" /> {userName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LegajoForm
            defaultValues={initial}
            onSubmit={async (values) => {
              await upsertUserPersonnelFile(id, values);
              toast.success("Guardado");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
