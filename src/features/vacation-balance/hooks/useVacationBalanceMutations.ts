import { useState } from "react";
import { toast } from "sonner";
import {
  bulkCreateVacationBalance,
  createVacationBalance,
  deleteVacationBalance,
  updateVacationBalance,
} from "../services/vacationBalance.service";
import axios from "axios";
import { getAxiosMessage } from "@/lib/errors/getAxiosErrorMessage";

type CreatePayload = {
  userId: string;
  year: number;
  totalDays: number;
};

export function useVacationBalanceMutations(onSuccess?: () => void) {
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [editingLoading, setEditingLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(payload: CreatePayload) {
    try {
      setCreatingLoading(true);
      await createVacationBalance(payload);
      toast.success("Saldo creado correctamente");
      onSuccess?.();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 400) {
          toast.warning("El período ya se encuentra cargado");
          throw err;
        }

        toast.error(
          err.response?.data?.message ?? "No se pudo crear el saldo"
        );
        throw err;
      }

      toast.error("No se pudo crear el saldo");
      throw err;
    } finally {
      setCreatingLoading(false);
    }
  }

  async function handleEdit(id: string, totalDays: number) {
    try {
      setEditingLoading(true);
      await updateVacationBalance(id, { totalDays });
      toast.success("Saldo actualizado correctamente");
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(getAxiosMessage(err, "No se pudo actualizar el saldo"));
      throw err;
    } finally {
      setEditingLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await deleteVacationBalance(id);
      toast.success("Saldo eliminado correctamente");
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(getAxiosMessage(err, "No se pudo eliminar el saldo"));
      throw err;
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkCreate() {
    try {
      setBulkLoading(true);
      await bulkCreateVacationBalance();
      toast.success("Saldos creados correctamente");
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(
        getAxiosMessage(err, "No se pudieron crear los saldos")
      );
      throw err;
    } finally {
      setBulkLoading(false);
    }
  }

  return {
    creatingLoading,
    editingLoading,
    bulkLoading,
    deletingId,
    handleCreate,
    handleEdit,
    handleDelete,
    handleBulkCreate,
  };
}