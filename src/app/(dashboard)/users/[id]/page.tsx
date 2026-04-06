"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, UserPen } from "lucide-react";
import { useCan } from "@/hooks/useCan";
import AccessDenied403Page from "../../403/page";
import { UserForm } from "@/features/users/components/UserForm";
import { UserFormValues } from "@/features/users/types/types";
import Loading from "../../loading";


type EditUserInitialValues = Partial<UserFormValues> & {
  id?: string;
  rol?: { id: number };
};

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const canEdit = useCan("usuarios", "editar");

  if (!canEdit) {
    return <AccessDenied403Page />;
  }

  return <EditUserContent id={id} />;
}

function EditUserContent({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<EditUserInitialValues | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const t = localStorage.getItem("token");
      const res = await fetch(`/api/users/${id}`, {
        headers: t ? { Authorization: `Bearer ${t}` } : {},
        cache: "no-store",
      });

      const data = await res.json();

      setInitial({
        id,
        userId: data.userId,
        email: data.email,
        nombre: data.nombre ?? "",
        apellido: data.apellido ?? "",
        avatarUrl: data.avatarUrl ?? "",
        rol: data.rol?.id ? { id: data.rol.id } : undefined,
        tipoDocumento: data.tipoDocumento ?? undefined,
        documento: data.documento ?? "",
        cuil: data.cuil ?? "",
        celular: data.celular ?? "",
        domicilio: data.domicilio ?? "",
        codigoPostal: data.codigoPostal ?? "",
        fechaNacimiento: data.fechaNacimiento ?? null,
        genero: data.genero ?? undefined,
        estadoCivil: data.estadoCivil ?? undefined,
        nacionalidad: data.nacionalidad ?? undefined,
      });

      setLoading(false);
    })();
  }, [id]);

  if (loading || !initial) {
    return <Loading />;
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <UserPen className="mr-2" />
            Editar usuario <Star className="ml-4 w-4 h-4" />
            Id: {initial.userId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            mode="edit"
            defaultValues={initial}
            onSuccess={(uid) => router.replace(`/users/${uid}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}