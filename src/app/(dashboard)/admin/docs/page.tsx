// app/(dashboard)/admin/docs/page.tsx
"use client";

import PdfUploader from "@/components/admin/PdfUploader";

export default function AdminDocsPage() {
  return (
    <div className="space-y-4">      
      <PdfUploader onUploaded={(f) => console.log("PDF:", f)} />
    </div>
  );
}
