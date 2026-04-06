"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useCan } from "@/hooks/useCan";
import AccessDenied403Page from "../../403/page";
import { UserForm } from "@/features/users/components/UserForm";

export default function NewUserPage() {
  const router = useRouter();
  const canInsert = useCan("usuarios", "crear");

  if (!canInsert) {
    return <AccessDenied403Page />;
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <User className="mr-2" />
            Alta de usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            mode="create"
            onSuccess={(id) => router.replace(`/users/${id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}