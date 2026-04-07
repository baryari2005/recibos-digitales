"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios";
import type { LeaveTypeUpdate } from "../types/leave-type.type";

type UseEditLeaveTypeParams = {
  enabled: boolean;
};

type LeaveTypeDetailResponse = {
  data?: LeaveTypeUpdate;
};

export function useEditLeaveType({ enabled }: UseEditLeaveTypeParams) {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const id = useMemo(
    () => (Array.isArray(rawId) ? rawId[0] : rawId)?.toString() ?? "",
    [rawId]
  );

  const [leaveType, setLeaveType] = useState<LeaveTypeUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [colorHex, setColorHex] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!enabled || !id) {
      setLoading(false);
      return;
    }

    const fetchLeaveType = async () => {
      try {
        const { data } = await axiosInstance.get<LeaveTypeDetailResponse>(
          `/leave-types/${id}`
        );

        const leaveTypeData = data.data;

        if (!leaveTypeData) {
          setError("No se pudo cargar el tipo de licencia.");
          return;
        }

        setLeaveType(leaveTypeData);
        setCode(leaveTypeData.code ?? "");
        setLabel(leaveTypeData.label ?? "");
        setColorHex(leaveTypeData.colorHex ?? "");
        setIsActive(Boolean(leaveTypeData.isActive));
      } catch (fetchError) {
        console.error("Error cargando tipo de licencia:", fetchError);
        setError("No se pudo cargar el tipo de licencia.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveType();
  }, [enabled, id]);

  const handleCancel = () => {
    router.push("/leave-types");
  };

  const handleSave = async () => {
    if (!id) return;

    setError(null);

    if (code.trim().length < 1) {
      setError("El código es obligatorio.");
      return;
    }

    if (label.trim().length < 1) {
      setError("La etiqueta es obligatoria.");
      return;
    }

    setSaving(true);

    try {
      await axiosInstance.put(`/leave-types/${id}`, {
        code: code.trim(),
        label: label.trim(),
        colorHex: colorHex.trim() || null,
        isActive,
      });

      toast.success("Tipo de licencia actualizado.");
      router.push("/leave-types");
      router.refresh();
    } catch (saveError: unknown) {
      if (axios.isAxiosError(saveError) && saveError.response?.status === 409) {
        setError("Ya existe otro tipo con ese código.");
      } else if (
        axios.isAxiosError(saveError) &&
        saveError.response?.status === 400
      ) {
        setError("Revisá los datos ingresados.");
      } else {
        setError("No se pudo guardar el tipo de licencia.");
      }

      console.error("Error guardando tipo de licencia:", saveError);
    } finally {
      setSaving(false);
    }
  };

  return {
    id,
    leaveType,
    loading,
    saving,
    error,
    code,
    label,
    colorHex,
    isActive,
    setCode,
    setLabel,
    setColorHex,
    setIsActive,
    handleSave,
    handleCancel,
  };
}
