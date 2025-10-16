// src/app/(dashboard)/users/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserList } from "@/components/users/UserList";
import { RoleGate } from "@/components/auth/RoleGate";
import { Users } from "lucide-react";

export default function UsersPage() {
  const [search, setSearch] = useState(""); // opcional: si querés un buscador arriba, pasalo a <UserList search={...} />

  return (
    <RoleGate allow={["admin"]} mode="render">
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center"><Users className="mr-2" />Usuarios</CardTitle>
            <Link href="/users/new">
              <Button size="lg" className="w-full h-11 rounded bg-[#008C93] hover:bg-[#007381]">Nuevo usuario</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <UserList search={search} />
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
