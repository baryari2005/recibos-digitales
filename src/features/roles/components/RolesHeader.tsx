import Link from "next/link";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  canCreate: boolean;
};

export function RolesHeader({ canCreate }: Props) {
  return (
    <CardHeader className="flex items-center justify-between">
      <CardTitle className="text-2xl flex items-center gap-2">
        <ShieldCheck className="w-6 h-6" />
        Roles
      </CardTitle>

      {canCreate && (
        <Link
          href="/roles/new"
        >
          <Button
            size="lg"
            className="h-11 rounded bg-[#008C93] hover:bg-[#007381] cursor-pointer"
          >
            <ShieldPlus className="w-4 h-4 mr-2" />
            Nuevo Rol
          </Button>
        </Link>
      )}
    </CardHeader>
  );
}