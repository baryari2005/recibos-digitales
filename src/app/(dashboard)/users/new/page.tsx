// src/app/(dashboard)/users/new/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { UserForm } from "@/components/users/UserForm";
import { RoleGate } from "@/components/auth/RoleGate";
import { User } from "lucide-react";

export default function NewUserPage() {
  const router = useRouter();
  return (
    <RoleGate allowIds={[2]} mode="render">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><User className="mr-2" />Alta de usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm mode="create" onSuccess={(id) => router.replace(`/users/${id}`)} />
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
