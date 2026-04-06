"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useCan } from "@/hooks/useCan";
import { UserPlus, Users } from "lucide-react";
import AccessDenied403Page from "../403/page";
import { UserList } from "@/features/users/components/UserList";

export default function UsersPage() {
  const [search] = useState("");

  const canView = useCan("usuarios", "ver");
  const canInsert = useCan("usuarios", "crear");

  if (!canView) {
    return <AccessDenied403Page />;
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="w-6 h-6" />
            Usuarios
          </CardTitle>

          {canInsert && (
            <Link href="/users/new">
              <Button
                size="lg"
                className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo usuario
              </Button>
            </Link>
          )}
        </CardHeader>

        <CardContent>
          <UserList search={search} />
        </CardContent>
      </Card>
    </div>
  );
}
