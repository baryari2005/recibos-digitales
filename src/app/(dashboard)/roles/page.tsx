"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { HasPermission } from "@/components/auth/HasPermission";

type RoleRow = {
  id: number;
  nombre: string;
  puedeAsignarEstablecimientos: boolean;
  requiereEstablecimientos: boolean;
  permisos: { permiso: { id: number; clave: string } }[];
};

export default function RolesPage() {
  const [data, setData] = useState<RoleRow[]>([]);
  const [open, setOpen] = useState(false);

  const fetchRoles = async () => {
    try {
      const { data } = await axiosInstance.get("/roles");
      setData(data);
    } catch {
      toast.error("No se pudo cargar roles");
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Roles</h1>
        <HasPermission need="roles.crear">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button>Nuevo rol</Button></DialogTrigger>
            <CreateRoleDialog onCreated={() => { setOpen(false); fetchRoles(); }} />
          </Dialog>
        </HasPermission>
      </div>
      <div className="border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Permisos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.nombre}</TableCell>
                <TableCell className="text-sm">
                  {r.permisos?.map(p => p.permiso.clave).join(", ") || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateRoleDialog({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ nombre: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await axiosInstance.post("/roles", form);
      toast.success("Rol creado");
      onCreated();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Error al crear rol");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nuevo rol</DialogTitle></DialogHeader>
      <div className="space-y-2">
        <Label>Nombre</Label>
        <Input value={form.nombre} onChange={(e) => setForm({ nombre: e.target.value })} />
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
