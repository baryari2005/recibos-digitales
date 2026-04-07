"use client";

import { useState } from "react";
import { FileSearch2 } from "lucide-react";
import { useCan } from "@/hooks/useCan";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReceiptsFilters } from "../../../../features/payroll/receipts/components/ReceiptsFilters";
import { ReceiptsSummary } from "../../../../features/payroll/receipts/components/ReceiptsSummary";
import { ReceiptsGroupedList } from "../../../../features/payroll/receipts/components/ReceiptsGroupedList";
import { usePayrollReceiptsAdmin } from "../../../../features/payroll/receipts/hooks/usePayrollReceiptsAdmin";
import { PayrollPdfViewerDialog } from "../../../../features/receipts/components/PayrollPdfViewerDialog";
import AccessDenied403Page from "../../403/page";

export default function PayrollReceiptsAdminPage() {
  const canAccess = useCan("recibos", "seguimiento");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{
    title: string;
    filePath: string | null;
    viewerUrl: string | null;
  }>({
    title: "PDF de recibo",
    filePath: null,
    viewerUrl: null,
  });

  const {
    q,
    setQ,
    status,
    setStatus,
    from,
    setFrom,
    to,
    setTo,
    loading,
    data,
    openCuil,
    applyFilters,
    clearAndReload,
    toggleGroup,
  } = usePayrollReceiptsAdmin({
    enabled: canAccess,
  });

  if (!canAccess) {
    return <AccessDenied403Page />;
  }

  return (
    <div className="grid gap-6 space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center">
            <FileSearch2 className="w-6 h-6 mr-2" />
            Seguimiento de Recibos Digitales
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <ReceiptsFilters
            q={q}
            setQ={setQ}
            status={status}
            setStatus={setStatus}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            loading={loading}
            onApply={applyFilters}
            onClear={clearAndReload}
          />

          {data && (
            <>
              <ReceiptsSummary summary={data.summary} />
              <Separator />
            </>
          )}

          <ReceiptsGroupedList
            groups={data?.groups ?? []}
            loading={loading}
            openCuil={openCuil}
            onToggleGroup={toggleGroup}
            onOpenReceipt={({ title, filePath, viewerUrl }) => {
              setSelectedReceipt({
                title,
                filePath,
                viewerUrl: viewerUrl ?? null,
              });
              setPreviewOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <PayrollPdfViewerDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={selectedReceipt.title}
        filePath={selectedReceipt.filePath}
        viewerUrl={selectedReceipt.viewerUrl}
      />
    </div>
  );
}
