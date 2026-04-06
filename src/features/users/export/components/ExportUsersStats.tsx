import { Timer, Users } from "lucide-react";
import { ExportUsersStats as ExportUsersStatsType } from "../types/export-users.types";

type Props = {
  stats: ExportUsersStatsType | null;
};

export function ExportUsersStats({ stats }: Props) {
  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded border p-4">
        <div className="text-sm text-muted-foreground">Exported users</div>
        <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
          <Users className="h-6 w-6" />
          {stats.users}
        </div>
      </div>

      <div className="rounded border p-4">
        <div className="text-sm text-muted-foreground">Exported employee records</div>
        <div className="mt-1 text-2xl font-semibold">{stats.legajos}</div>
      </div>

      <div className="rounded border p-4">
        <div className="text-sm text-muted-foreground">Elapsed time</div>
        <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
          <Timer className="h-6 w-6" />
          {(stats.elapsedMs / 1000).toFixed(2)}s
        </div>
      </div>

      {stats.filename && (
        <div className="md:col-span-3 text-sm text-muted-foreground">
          File: <b>{stats.filename}</b>
        </div>
      )}
    </div>
  );
}