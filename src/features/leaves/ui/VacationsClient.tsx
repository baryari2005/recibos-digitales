"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLeaves } from "../hooks/useLeaves";
import { LeavesTable } from "./LeavesTable";
import { RequestLeaveDialog } from "./RequestLeaveDialog";

export function VacationsClient() {
  const { leaves, isLoading, refresh } = useLeaves();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          Solicitar vacaciones
        </Button>
      </div>

      <LeavesTable items={leaves} />

      <RequestLeaveDialog
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false);
          refresh();
        }}
      />
    </>
  );
}
