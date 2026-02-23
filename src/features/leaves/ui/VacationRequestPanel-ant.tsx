// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { DateRange } from "react-day-picker";
// import { axiosInstance } from "@/lib/axios";

// import { LeaveTypeStep } from "./steps/LeaveTypeStep";
// import { LeaveCalendarStep } from "./steps/LeaveCalendarStep";
// import { LeaveNotesStep } from "./steps/LeaveNotesStep";
// import { LeaveConfirmExitStep } from "./steps/LeaveConfirmExitStep";

// import { useLeaves } from "../hooks/useLeaves";
// import { CalendarDays } from "lucide-react";
// import { useVacationBalance } from "@/features/leaves/hooks/useVacationBalance";
// import { calcLeaveDays } from "../domain/calcLeaveDays";

// type Step = 1 | 2 | 3 | 4 | "confirm-exit";
// type Props = {
//   fixedType?: string;
//   excludeTypes?: string[];
//   onCreated?: () => void;
// };

// function isNumberStep(step: Step): step is 1 | 2 | 3 | 4 {
//   return typeof step === "number";
// }

// export function VacationRequestPanel({
//   fixedType,
//   excludeTypes = [],
//   onCreated,
// }: Props) {
//   const [step, setStep] = useState<Step>(fixedType ? 2 : 1);
//   const [type, setType] = useState<string | undefined>(
//     fixedType ?? undefined
//   );
//   const [range, setRange] = useState<DateRange>();
//   const [note, setNote] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   const { refresh: refreshBalance } = useVacationBalance();
//   const { refresh } = useLeaves();

//   const isValidRange =
//     !!range?.from &&
//     !!range?.to &&
//     calcLeaveDays(range.from, range.to) > 0;

//   function resetAll() {
//     setStep(fixedType ? 2 : 1);
//     setType(fixedType ?? undefined);
//     setRange(undefined);
//     setNote("");
//     setErrorMsg(null);
//   }

//   async function submit() {
//     if (!type || !range?.from || !range?.to) return;

//     setLoading(true);
//     setErrorMsg(null);

//     try {
//       await axiosInstance.post("/leaves", {
//         type,
//         startYmd: range.from.toISOString().slice(0, 10),
//         endYmd: range.to.toISOString().slice(0, 10),
//         daysCount: calcLeaveDays(range.from, range.to),
//         note,
//       });

//       // ✅ éxito
//       resetAll();
//       refresh();          // refresca historial inmediato
//       refreshBalance();   // refresca balance inmediato
//       onCreated?.();

//     } catch (err: any) {
//       const status = err?.response?.status;

//       if (status === 400) {
//         setErrorMsg(
//           err.response?.data?.error ??
//           "No tenés días de vacaciones disponibles"
//         );
//       } else if (status === 401) {
//         setErrorMsg("Tu sesión expiró. Volvé a iniciar sesión.");
//       } else {
//         setErrorMsg("Ocurrió un error al solicitar la licencia.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   const canNext =
//     (step === 1 && !!type) ||
//     (step === 2 && isValidRange) ||
//     (isNumberStep(step) && step >= 3);

//   return (
//     <div className="h-full flex flex-col">
//       <div className="pb-2 ml-4">
//         <div className="flex items-center gap-2 text-[#008C93]">
//           <CalendarDays className="w-4 h-4" />
//           <h2 className="text-base font-medium mt-1">Solicitar</h2>
//         </div>
//       </div>

//       <div className="flex-1 py-4">
//         {step === 1 && !fixedType && (
//           <LeaveTypeStep
//             value={type}
//             onChange={setType}
//             excludeTypes={excludeTypes}
//           />
//         )}

//         {step === 2 && (
//           <LeaveCalendarStep value={range} onChange={setRange} />
//         )}

//         {step === 3 && (
//           <LeaveNotesStep value={note} onChange={setNote} />
//         )}

//         {step === 4 && (
//           <div className="text-sm space-y-2">
//             <p><strong>Tipo:</strong> {type}</p>
//             <p><strong>Desde:</strong> {range?.from?.toLocaleDateString()}</p>
//             <p><strong>Regreso:</strong> {range?.to?.toLocaleDateString()}</p>
//             <p><strong>Días:</strong> {calcLeaveDays(range!.from!, range!.to!)}</p>
//           </div>
//         )}

//         {step === "confirm-exit" && (
//           <LeaveConfirmExitStep
//             onConfirm={resetAll}
//             onCancel={() => setStep(1)}
//           />
//         )}
//       </div>

//       {errorMsg && (
//         <div className="mb-3 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">
//           {errorMsg}
//         </div>
//       )}

//       {step !== "confirm-exit" && (
//         <div className="pt-2 border-t flex justify-between">
//           <Button
//             className="w-40 h-11 rounded bg-[#008C93] hover:bg-[#007381]"
//             onClick={() => {
//               setErrorMsg(null);
//               setStep("confirm-exit");
//             }}
//           >
//             Salir
//           </Button>

//           {step < 4 ? (
//             <Button
//               disabled={!canNext}
//               onClick={() =>
//                 setStep((s) =>
//                   isNumberStep(s) ? ((s + 1) as Step) : s
//                 )
//               }
//               className="w-40 h-11 rounded bg-[#008C93] hover:bg-[#007381]"
//             >
//               Siguiente
//             </Button>
//           ) : (
//             <Button
//               disabled={loading}
//               onClick={submit}
//               className="w-40 h-11 rounded bg-[#008C93] hover:bg-[#007381]"
//             >
//               {loading ? "Enviando..." : "Solicitar"}
//             </Button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
