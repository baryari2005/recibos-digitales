// "use client";

// import { useLeaves } from "../hooks/useLeaves";

// import { ClipboardList, Plane, Sunrise } from "lucide-react";
// import { CenteredSpinner } from "@/components/CenteredSpinner";
// import { LeavesList } from "./LeavesList";

// type Props = {
//   type?: "VACACIONES" | "OTHER";
//   refreshToken?: number;
// };

// export function VacationHistoryPanel({ type, refreshToken }: Props) {
//   const { leaves, isLoading } = useLeaves({ type });

//   const isVacation = type === "VACACIONES";

//   const title = isVacation
//     ? "Historial de vacaciones"
//     : "Historial de licencias";

//   return (
//     <div className="h-full flex flex-col gap-2">
//       <div className="flex items-center gap-2 text-[#008C93]">
//         {isVacation ? (
//           <Sunrise className="w-4 h-4" />
//         ) : (
//           <ClipboardList className="w-4 h-4" />
//         )}
//         <h2 className="text-base font-medium mt-1">{title}</h2>
//       </div>

//       <div className="flex-1 overflow-auto pr-1">
//         {isLoading ? (
//           <CenteredSpinner label="Cargando..." />
//         ) : (
//           // <LeavesTable items={leaves} />
//           <LeavesList type={type} refreshToken={refreshToken}/>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { ClipboardList, Sunrise } from "lucide-react";
import { LeavesList } from "./LeavesList";

type Props = {
  type?: "VACACIONES" | "OTHER";
  refreshToken?: number;
};

export function VacationHistoryPanel({ type, refreshToken }: Props) {
  const isVacation = type === "VACACIONES";

  const title = isVacation
    ? "Historial de vacaciones"
    : "Historial de licencias";

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[#008C93]">
        {isVacation ? (
          <Sunrise className="w-4 h-4" />
        ) : (
          <ClipboardList className="w-4 h-4" />
        )}
        <h2 className="text-base font-medium mt-1">{title}</h2>
      </div>

      <div className="flex-1 overflow-auto pr-1">
        <LeavesList type={type} refreshToken={refreshToken} />
      </div>
    </div>
  );
}
