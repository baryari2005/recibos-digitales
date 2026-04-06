import { CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet } from "lucide-react";

export function ExportUsersHeader() {
  return (
    <CardHeader className="flex items-center justify-between">
      <CardTitle className="text-2xl flex items-center gap-2">
        <FileSpreadsheet className="w-6 h-6" />
        Export users
      </CardTitle>
    </CardHeader>
  );
}