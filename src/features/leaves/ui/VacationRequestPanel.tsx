"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { axiosInstance } from "@/lib/axios";

import { LeaveTypeStep } from "./steps/LeaveTypeStep";
import { LeaveCalendarStep } from "./steps/LeaveCalendarStep";
import { LeaveNotesStep } from "./steps/LeaveNotesStep";
import { LeaveConfirmExitStep } from "./steps/LeaveConfirmExitStep";

import { useLeaves } from "../hooks/useLeaves";
import { CalendarDays, Clock, ListChecks } from "lucide-react";
import { useVacationBalance } from "@/features/leaves/hooks/useVacationBalance";
import { calcLeaveDays } from "../domain/calcLeaveDays";
import { PendingVacationBlock } from "./PendingVacationBlock";

type Step = 1 | 2 | 3 | 4 | "confirm-exit";
type Props = {
  fixedType?: string;
  excludeTypes?: string[];
  onCreated?: () => void;
};

function isNumberStep(step: Step): step is 1 | 2 | 3 | 4 {
  return typeof step === "number";
}

export function VacationRequestPanel({
  fixedType,
  excludeTypes = [],
  onCreated,
}: Props) {
  const [step, setStep] = useState<Step>(fixedType ? 2 : 1);
  const [type, setType] = useState<string | undefined>(fixedType ?? undefined);
  const [range, setRange] = useState<DateRange>();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { refresh: refreshBalance } = useVacationBalance();
  const { refresh } = useLeaves();

  const effectiveType = fixedType ?? type;
  const isVacation = effectiveType === "VACACIONES";

  // ✅ Solo consulta pendientes si es VACACIONES (requiere useLeaves con enabled/q/pageSize)
  const { leaves: pendingVacations } = useLeaves({
    type: "VACACIONES",
    q: "PENDIENTE",
    pageSize: 1,
    enabled: isVacation,
  });

  const hasPendingVacation = isVacation && pendingVacations.length > 0;
  const pending = hasPendingVacation ? pendingVacations[0] : null;
  const disableFlow = isVacation && hasPendingVacation;

  const isValidRange =
    !!range?.from && !!range?.to && calcLeaveDays(range.from, range.to) > 0;

  function resetAll() {
    setStep(fixedType ? 2 : 1);
    setType(fixedType ?? undefined);
    setRange(undefined);
    setNote("");
    setErrorMsg(null);
  }

  async function submit() {
    if (!effectiveType || !range?.from || !range?.to) return;

    // extra safety
    if (disableFlow) {
      setErrorMsg(
        pending
          ? `Tenés una solicitud de vacaciones pendiente de aprobación (${pending.startYmd} → ${pending.endYmd}).`
          : "Tenés una solicitud de vacaciones pendiente de aprobación."
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await axiosInstance.post("/leaves", {
        type: effectiveType,
        startYmd: range.from.toISOString().slice(0, 10),
        endYmd: range.to.toISOString().slice(0, 10),
        daysCount: calcLeaveDays(range.from, range.to),
        note,
      });

      resetAll();
      refresh();
      refreshBalance();
      onCreated?.();
    } catch (err: any) {
      const status = err?.response?.status;

      // ✅ Conflictos (pendiente o superposición)
      if (status === 409) {
        const code = err.response?.data?.code;
        const overlap = err.response?.data?.overlap;
        const pendingFromApi = err.response?.data?.pending;

        if (code === "VACATION_DATE_OVERLAP" && overlap) {
          setErrorMsg(
            `Las fechas se superponen con una solicitud ${String(
              overlap.status
            ).toLowerCase()} existente (${overlap.startYmd} → ${overlap.endYmd}).`
          );
          return;
        }

        if (code === "PENDING_VACATION_EXISTS" && pendingFromApi) {
          setErrorMsg(
            `Tenés una solicitud de vacaciones pendiente de aprobación (${pendingFromApi.startYmd} → ${pendingFromApi.endYmd}). No podés cargar otra.`
          );
          return;
        }

        setErrorMsg(err.response?.data?.error ?? "Conflicto al solicitar vacaciones.");
        return;
      }

      if (status === 400) {
        setErrorMsg(
          err.response?.data?.error ?? "No tenés días de vacaciones disponibles"
        );
      } else if (status === 401) {
        setErrorMsg("Tu sesión expiró. Volvé a iniciar sesión.");
      } else {
        setErrorMsg("Ocurrió un error al solicitar la licencia.");
      }
    } finally {
      setLoading(false);
    }
  }

  const canNext =
    (step === 1 && !!type) ||
    (step === 2 && isValidRange) ||
    (isNumberStep(step) && step >= 3);

  const pendingLabel = pending ? `(${pending.startYmd} → ${pending.endYmd})` : "";

  // ✅ Render alternativo: cuando hay pendiente, NO mostramos wizard (sin romper el layout)
  if (disableFlow) {
    return (
      <div className="h-full flex flex-col">
        {/* Header (si querés mantener el título “Solicitar”) */}
        <div className="pb-2 ml-4">
          <div className="flex items-center gap-2 text-[#008C93]">
            <CalendarDays className="w-4 h-4" />
            <h2 className="text-base font-medium mt-1">Solicitar</h2>
          </div>
        </div>

        {/* ✅ Render real del componente */}
        <PendingVacationBlock
          pendingLabel={pendingLabel}
          onViewRequests={() => {
            const el = document.getElementById("vacations-history");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="pb-2 ml-4">
        <div className="flex items-center gap-2 text-[#008C93]">
          <CalendarDays className="w-4 h-4" />
          <h2 className="text-base font-medium mt-1">Solicitar</h2>
        </div>
      </div>

      <div className="flex-1 py-4">
        {step === 1 && !fixedType && (
          <LeaveTypeStep
            value={type}
            onChange={setType}
            excludeTypes={excludeTypes}
          />
        )}

        {step === 2 && <LeaveCalendarStep value={range} onChange={setRange} />}

        {step === 3 && <LeaveNotesStep value={note} onChange={setNote} />}

        {step === 4 && (
          <div className="text-sm space-y-2">
            <p><strong>Tipo:</strong> {effectiveType}</p>
            <p><strong>Desde:</strong> {range?.from?.toLocaleDateString()}</p>
            <p><strong>Regreso:</strong> {range?.to?.toLocaleDateString()}</p>
            <p><strong>Días:</strong>{" "}{range?.from && range?.to ? calcLeaveDays(range.from, range.to) : 0}</p>
          </div>
        )}

        {step === "confirm-exit" && (
          <LeaveConfirmExitStep
            onConfirm={resetAll}
            onCancel={() => setStep(1)}
          />
        )}
      </div>

      {errorMsg && (
        <div className="mb-3 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {step !== "confirm-exit" && (
        <div className="pt-2 border-t flex justify-between">
          <Button
            className="w-40 h-11 rounded bg-[#008C93] hover:bg-[#007381]"
            onClick={() => {
              setErrorMsg(null);
              setStep("confirm-exit");
            }}
          >
            Salir
          </Button>

          {step < 4 ? (
            <Button
              disabled={!canNext}
              onClick={() =>
                setStep((s) => (isNumberStep(s) ? ((s + 1) as Step) : s))
              }
              className="w-40 h-11 rounded bg-[#008C93] hover:bg-[#007381]"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              disabled={loading}
              onClick={submit}
              className="w-40 h-11 rounded bg-[#008C93] hover:bg-[#007381]"
            >
              {loading ? "Enviando..." : "Solicitar"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}