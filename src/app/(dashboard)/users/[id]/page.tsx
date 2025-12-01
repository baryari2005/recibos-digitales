// src/app/(dashboard)/users/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/users/UserForm";
import { axiosInstance } from "@/lib/axios";
import { RoleGate } from "@/components/auth/RoleGate";
import { CenteredSpinner } from "@/components/CenteredSpinner";
import { Asterisk, Star, StarHalf, UserCog, UserPen } from "lucide-react";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <RoleGate allowIds={[2]} mode="render">
      <EditUserContent id={id} />
    </RoleGate>
  );
}

function EditUserContent({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // const { data } = await axiosInstance.get(`/users/${id}`);
      const t = localStorage.getItem("token");
      const res = await fetch(`/api/users/${id}`, {
        headers: t ? { Authorization: `Bearer ${t}` } : {},
        cache: "no-store",
      });
      console.log("[FETCH][/api/users/:id] status", res.status);
      const data = await res.json();
      console.log("[FETCH][/api/users/:id] body", data);

      setInitial({
        id: data.id,
        userId: data.userId,
        email: data.email,
        nombre: data.nombre ?? "",
        apellido: data.apellido ?? "",
        avatarUrl: data.avatarUrl ?? "",
        rolId: data.rolId ?? data.rol?.id ?? 1,
        tipoDocumento: data.tipoDocumento ?? undefined,
        documento: data.documento ?? "",
        cuil: data.cuil ?? "",
        celular: data.celular ?? "",
        domicilio: data.domicilio ?? "",
        codigoPostal: data.codigoPostal ?? "",
        // fechaNacimiento: data.fechaNacimiento
        //   ? new Date(data.fechaNacimiento) // si viene ISO string
        //   : null,
        fechaNacimiento: data.fechaNacimiento ?? null, 
        genero: data.genero ?? undefined,
        estadoCivil: data.estadoCivil ?? undefined,
        nacionalidad: data.nacionalidad ?? undefined,
      });
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <CenteredSpinner label="Cargando..." />
  );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <UserPen className="mr-2" />Editar usuario  <Star className="ml-4 w-4 h-4" />Id: {initial.userId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm mode="edit" defaultValues={initial} onSuccess={(uid) => router.replace(`/users/${uid}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
