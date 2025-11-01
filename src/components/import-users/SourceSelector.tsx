// src/components/import-users/SourceSelector.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Source } from "./types";

export default function SourceSelector({
  source,
  setSource,
  clearData,
}: {
  source: Source;
  setSource: (s: Source) => void;
  clearData: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Label className="text-sm">Fuente:</Label>

      <div className="inline-flex h-11 rounded-md overflow-hidden border">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            clearData();
            setSource("pdf");
          }}
          aria-pressed={source === "pdf"}
          className={cn(
            "h-full rounded-none px-4 font-medium focus-visible:ring-2 focus-visible:ring-[#008C93]",
            source === "pdf"
              ? "bg-[#008C93] text-white hover:bg-[#008C93] hover:text-white"
              : "text-[#008C93] hover:bg-[#008C93]/10 hover:text-[#008C93]"
          )}
        >
          PDF
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            clearData();
            setSource("excel");
          }}
          aria-pressed={source === "excel"}
          className={cn(
            "h-full rounded-none px-4 font-medium -ml-px border-l border-black focus-visible:ring-2 focus-visible:ring-[#008C93]",
            source === "excel"
              ? "bg-[#008C93] text-white hover:bg-[#008C93] hover:text-white"
              : "text-[#008C93] hover:bg-[#008C93]/10 hover:text-[#008C93]"
          )}
        >
          Excel / CSV
        </Button>
      </div>
    </div>
  );
}
