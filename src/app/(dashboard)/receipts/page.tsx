"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileSignature } from "lucide-react";

import { useReceipts } from "@/features/receipts/hooks/useReceipts";
import { ReceiptsTabs } from "@/features/receipts/components/ReceiptsTabs";
import { ReceiptsList } from "@/features/receipts/components/ReceiptsList";
import { ReceiptViewer } from "@/features/receipts/components/ReceiptViewer";

export default function MisDocumentosPage() {
  const searchParams = useSearchParams();
  const refreshQP = searchParams.get("v");

  const {
    data, tab, setTab,
    selected, setSelected,
    list, loading, signing,
    handleSign,
  } = useReceipts(refreshQP);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center">
            <FileSignature className="mr-2" /> Mis Documentos
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
            {/* Columna izquierda */}
            <Card className="h-[calc(100vh-120px)] overflow-hidden">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="-mx-0 px-3 mb-2 h-11">
                  <ReceiptsTabs
                    tab={tab}
                    setTab={setTab}
                    pendingCount={data?.pending.length ?? 0}
                    signedCount={data?.signed.length ?? 0}
                  />
                </div>
                <Separator />
                <ReceiptsList
                  list={list}
                  loading={loading}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelected}
                />
              </CardContent>
            </Card>

            {/* Columna derecha */}
            <Card className="h-[calc(100vh-120px)] overflow-hidden">
              <CardContent className="p-0 h-full flex flex-col">
                <ReceiptViewer
                  selected={selected}
                  signing={signing}
                  onSign={handleSign}
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
