import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

type Props = {
  loading: boolean;
  onExport: () => Promise<void> | void;
};

export function ExportUsersAction({ loading, onExport }: Props) {
  return (
    <Button
      onClick={onExport}
      disabled={loading}
      className="w-full h-11 rounded bg-[#008C93] hover:bg-[#007381]"
    >
      {loading ? (
        <>
          <FileDown className="h-5 w-5 mr-2 animate-bounce" />
          Exporting...
        </>
      ) : (
        <>
          <FileDown className="h-5 w-5 mr-2" />
          Export to Excel
        </>
      )}
    </Button>
  );
}