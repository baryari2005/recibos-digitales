"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExportUsersHeader } from "./ExportUsersHeader";
import { ExportUsersAction } from "./ExportUsersAction";
import { ExportUsersStats } from "./ExportUsersStats";
import { useExportUsers } from "../hooks/useExportUsers";

export function ExportUsersView() {
  const { loading, stats, handleExport } = useExportUsers();

  return (
    <div className="grid gap-6">
      <Card>
        <ExportUsersHeader />

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Generates an Excel file with two sheets: <b>Users</b> and <b>Employee Records</b>.
          </p>

          <ExportUsersAction loading={loading} onExport={handleExport} />

          <Separator />

          <ExportUsersStats stats={stats} />
        </CardContent>
      </Card>
    </div>
  );
}