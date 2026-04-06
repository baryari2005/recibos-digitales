"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/useCan";
import { Switch } from '@/components/ui/switch';
import AccessDenied403Page from "../../403/page";
import axios from "axios";

export default function NewRolePage() {
  const router = useRouter();
  const canCreate = useCan("roles", "crear");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canCreate) {
    return <AccessDenied403Page />;
  }

  const handleSubmit = async () => {
    setError(null);

    if (nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axiosInstance.post("/roles", {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        activo,
      });

      const newRoleId = data.data.id;

      router.push(`/roles/${newRoleId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setError("Ya existe un rol con ese nombre.");
      } else {
        setError("Ocurrió un error al crear el rol.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Crear Nuevo Rol
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nombre
            </label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Supervisor"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Descripción
            </label>
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
            />
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <p className="text-sm font-medium">
                Rol activo
              </p>
              <p className="text-xs text-muted-foreground">
                Si está inactivo no podrá asignarse a usuarios.
              </p>
            </div>
            <Switch
              checked={activo}
              onCheckedChange={setActivo}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/roles")}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Rol"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}