import Link from "next/link";
import { CalendarCog, PlusCircle } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  canCreate: boolean;
};

export function LeaveTypesHeader({ canCreate }: Props) {
  return (
    <CardHeader className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2 text-2xl">
        <CalendarCog className="h-6 w-6" />
        Tipos de licencia
      </CardTitle>

      {canCreate && (
        <Link href="/leave-types/new">
          <Button
            size="lg"
            className="h-11 rounded bg-[#008C93] cursor-pointer hover:bg-[#007381]"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo tipo
          </Button>
        </Link>
      )}
    </CardHeader>
  );
}
