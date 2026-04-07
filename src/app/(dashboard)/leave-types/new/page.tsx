"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";
import { useCan } from "@/hooks/useCan";
import AccessDenied403Page from "../../403/page";
import { LeaveTypeForm } from "@/features/leave-types/components/LeaveTypeForm";

type CreateLeaveTypeResponse = {
  data?: {
    id: number;
  };
};

export default function NewLeaveTypePage() {
  const router = useRouter();
  const canCreate = useCan("tipo_licencia", "crear");

  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [colorHex, setColorHex] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canCreate) {
    return <AccessDenied403Page />;
  }

  const handleSubmit = async () => {
    setError(null);

    if (code.trim().length < 1) {
      setError("El código es obligatorio.");
      return;
    }

    if (label.trim().length < 1) {
      setError("La etiqueta es obligatoria.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axiosInstance.post<CreateLeaveTypeResponse>(
        "/leave-types",
        {
          code: code.trim(),
          label: label.trim(),
          colorHex: colorHex.trim() || null,
          isActive,
        }
      );

      const newLeaveTypeId = data.data?.id;

      if (!newLeaveTypeId) {
        throw new Error("MISSING_ID");
      }

      router.push(`/leave-types/${newLeaveTypeId}`);
    } catch (submitError: unknown) {
      if (
        axios.isAxiosError(submitError) &&
        submitError.response?.status === 409
      ) {
        setError("Ya existe un tipo con ese código.");
      } else if (
        axios.isAxiosError(submitError) &&
        submitError.response?.status === 400
      ) {
        setError("Revisá los datos ingresados.");
      } else {
        setError("Ocurrió un error al crear el tipo de licencia.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LeaveTypeForm
      title="Crear nuevo tipo de licencia"
      submitLabel="Crear tipo"
      code={code}
      label={label}
      colorHex={colorHex}
      isActive={isActive}
      loading={loading}
      error={error}
      onCodeChange={setCode}
      onLabelChange={setLabel}
      onColorHexChange={setColorHex}
      onIsActiveChange={setIsActive}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/leave-types")}
    />
  );
}
