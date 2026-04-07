"use client";

import { useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import axios from "axios";
import { CalendarDays, Paperclip, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";
import { useVacationBalance } from "@/features/vacation-balance/hooks/useVacationBalance";
import { useLeaves } from "../hooks/useLeaves";
import { LeaveTypeStep } from "./steps/LeaveTypeStep";
import { LeaveCalendarStep } from "./steps/LeaveCalendarStep";
import { LeaveNotesStep } from "./steps/LeaveNotesStep";
import { LeaveConfirmExitStep } from "./steps/LeaveConfirmExitStep";
import { PendingVacationBlock } from "./PendingVacationBlock";

type Step = 1 | 2 | 3 | 4 | 5 | "confirm-exit";

type Props = {
  fixedType?: string;
  excludeTypes?: string[];
  onCreated?: () => void;
};

function isNumberStep(step: Step): step is 1 | 2 | 3 | 4 | 5 {
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
  const [files, setFiles] = useState<File[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [daysCount, setDaysCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { refresh: refreshBalance } = useVacationBalance();
  const { refresh } = useLeaves();

  const effectiveType = fixedType ?? type;
  const isVacation = effectiveType === "VACACIONES";
  const finalStep = isVacation ? 4 : 5;

  const { leaves: pendingVacations } = useLeaves({
    type: "VACACIONES",
    q: "PENDIENTE",
    pageSize: 1,
    enabled: isVacation,
  });

  const hasPendingVacation = isVacation && pendingVacations.length > 0;
  const pending = hasPendingVacation ? pendingVacations[0] : null;
  const disableFlow = isVacation && hasPendingVacation;

  const isValidRange = !!range?.from && !!range?.to && daysCount > 0;

  function resetAll() {
    setStep(fixedType ? 2 : 1);
    setType(fixedType ?? undefined);
    setRange(undefined);
    setNote("");
    setFiles([]);
    setIsDraggingFiles(false);
    setErrorMsg(null);
    setDaysCount(0);
  }

  function addFiles(selected: File[]) {
    if (!selected.length) return;

    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    const validFiles = selected.filter((file) => {
      const validMime =
        allowedMimeTypes.includes(file.type) ||
        /\.(pdf|jpg|jpeg|png)$/i.test(file.name);

      const validSize = file.size <= 16 * 1024 * 1024;

      return validMime && validSize;
    });

    if (validFiles.length !== selected.length) {
      setErrorMsg(
        "Algunos archivos fueron ignorados. Solo se permiten PDF, JPG o PNG de hasta 16MB."
      );
    } else {
      setErrorMsg(null);
    }

    setFiles((prev) => [...prev, ...validFiles]);
  }

  function removeFile(indexToRemove: number) {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    addFiles(selected);
    event.target.value = "";
  }

  function handleFilesDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFiles(false);
    addFiles(Array.from(event.dataTransfer.files ?? []));
  }

  async function submit() {
    if (!effectiveType || !range?.from || !range?.to) return;

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
      const formData = new FormData();
      formData.append("type", effectiveType);
      formData.append("startYmd", range.from.toISOString().slice(0, 10));
      formData.append("endYmd", range.to.toISOString().slice(0, 10));
      formData.append("daysCount", String(daysCount));
      formData.append("note", note);

      if (!isVacation) {
        for (const file of files) {
          formData.append("files", file);
        }
      }

      await axiosInstance.post("/leaves", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      resetAll();
      refresh();
      refreshBalance();
      onCreated?.();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as
          | {
              code?: string;
              error?: string;
              overlap?: {
                status?: string;
                startYmd?: string;
                endYmd?: string;
              };
              pending?: {
                startYmd?: string;
                endYmd?: string;
              };
            }
          | undefined;

        if (status === 409) {
          const code = data?.code;
          const overlap = data?.overlap;
          const pendingFromApi = data?.pending;

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

          setErrorMsg(data?.error ?? "Conflicto al solicitar vacaciones.");
          return;
        }

        if (status === 400) {
          setErrorMsg(data?.error ?? "No se pudo procesar la solicitud.");
          return;
        }

        if (status === 401) {
          setErrorMsg("Tu sesión expiró. Volvé a iniciar sesión.");
          return;
        }
      }

      setErrorMsg("Ocurrió un error al solicitar la licencia.");
    } finally {
      setLoading(false);
    }
  }

  const canNext =
    (step === 1 && !!type) ||
    (step === 2 && isValidRange) ||
    (isNumberStep(step) && step >= 3);

  const pendingLabel = pending ? `(${pending.startYmd} → ${pending.endYmd})` : "";

  if (disableFlow) {
    return (
      <div className="flex h-full flex-col">
        <div className="ml-4 pb-2">
          <div className="flex items-center gap-2 text-[#008C93]">
            <CalendarDays className="h-4 w-4" />
            <h2 className="mt-1 text-base font-medium">Solicitar</h2>
          </div>
        </div>

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
    <div className="flex h-full flex-col">
      <div className="ml-4 pb-2">
        <div className="flex items-center gap-2 text-[#008C93]">
          <CalendarDays className="h-4 w-4" />
          <h2 className="mt-1 text-base font-medium">Solicitar</h2>
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

        {step === 2 && (
          <LeaveCalendarStep
            value={range}
            onChange={setRange}
            type={effectiveType}
            onDaysChange={setDaysCount}
          />
        )}

        {step === 3 && <LeaveNotesStep value={note} onChange={setNote} />}

        {step === 4 && !isVacation && (
          <div className="space-y-4">
            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Paperclip className="h-4 w-4" />
                Adjuntar certificados
              </div>

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingFiles(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDraggingFiles(false);
                }}
                onDrop={handleFilesDrop}
                className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  isDraggingFiles
                    ? "border-[#008C93] bg-[#008C93]/5"
                    : "border-muted-foreground/25"
                }`}
              >
                <Upload className="mx-auto mb-3 h-6 w-6 text-[#008C93]" />
                <p className="text-sm font-medium">
                  Arrastrá archivos acá o elegilos manualmente
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, JPG o PNG de hasta 16MB por archivo.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFilesChange}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 h-10 rounded"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Seleccionar archivos
                </Button>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {((step === 4 && isVacation) || step === 5) && (
          <div className="space-y-2 text-sm">
            <p>
              <strong>Tipo:</strong> {effectiveType}
            </p>
            <p>
              <strong>Desde:</strong> {range?.from?.toLocaleDateString()}
            </p>
            <p>
              <strong>Regreso:</strong> {range?.to?.toLocaleDateString()}
            </p>
            <p>
              <strong>Días:</strong> {daysCount}
            </p>
            {note ? (
              <p>
                <strong>Observaciones:</strong> {note}
              </p>
            ) : null}
            {!isVacation ? (
              files.length > 0 ? (
                <div>
                  <strong>Adjuntos:</strong>
                  <ul className="mt-1 list-disc pl-5">
                    {files.map((file, index) => (
                      <li key={`${file.name}-${index}`}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted-foreground">Sin archivos adjuntos.</p>
              )
            ) : null}
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
        <div className="flex justify-between border-t pt-2">
          <Button
            className="h-11 w-40 rounded bg-[#008C93] hover:bg-[#007381]"
            onClick={() => {
              setErrorMsg(null);
              setStep("confirm-exit");
            }}
          >
            Salir
          </Button>

          {step < finalStep ? (
            <Button
              disabled={!canNext}
              onClick={() =>
                setStep((s) => (isNumberStep(s) ? ((s + 1) as Step) : s))
              }
              className="h-11 w-40 rounded bg-[#008C93] hover:bg-[#007381]"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              disabled={loading}
              onClick={submit}
              className="h-11 w-40 rounded bg-[#008C93] hover:bg-[#007381]"
            >
              {loading ? "Enviando..." : "Solicitar"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
