"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type PermissionRow = { id: number; clave: string; descripcion: string; modulo: string; accion: string };

export default function PermissionsPage() {
  const [data, setData] = useState<PermissionRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get("/permissions");
        setData(data);
      } catch {
        toast.error("No se pudo cargar permisos");
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Permisos</h1>
      <div className="border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clave</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.clave}</TableCell>
                <TableCell>{p.modulo}</TableCell>
                <TableCell>{p.accion}</TableCell>
                <TableCell>{p.descripcion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
