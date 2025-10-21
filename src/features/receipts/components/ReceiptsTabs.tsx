"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TabKey } from "../../receipts/types";

export function ReceiptsTabs({
  tab,
  setTab,
  pendingCount = 0,
  signedCount = 0,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  pendingCount?: number;
  signedCount?: number;
}) {
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full rounded">
      <TabsList className="grid grid-cols-2 w-full h-11 bg-muted p-0 rounded-none overflow-hidden">
        <TabsTrigger
          value="pending"
          className="group w-full h-11 rounded-none border-0 shadow-none
                     data-[state=active]:!bg-[#008C93] aria-selected:!bg-[#008C93]
                     data-[state=active]:!text-white aria-selected:!text-white
                     data-[state=active]:shadow-none data-[state=active]:ring-0"
        >
          Pendientes
          <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full
                           bg-foreground/10 px-1 text-xs
                           group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
            {pendingCount}
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="signed"
          className="group w-full h-11 rounded-none border-0 shadow-none
                     data-[state=active]:!bg-[#008C93] aria-selected:!bg-[#008C93]
                     data-[state=active]:!text-white aria-selected:!text-white
                     data-[state=active]:shadow-none data-[state=active]:ring-0"
        >
          Firmados
          <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full
                           bg-foreground/10 px-1 text-xs
                           group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
            {signedCount}
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
