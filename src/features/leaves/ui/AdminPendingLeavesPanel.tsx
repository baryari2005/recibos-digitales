// "use client";

// import { Button } from "@/components/ui/button";
// import { Loader2, Check, X } from "lucide-react";
// import { useState } from "react";
// import { useAdminPendingLeaves } from "../hooks/useAdminPendingLeaves";
// import { axiosInstance } from "@/lib/axios";

// type Props = {
//   type?: "VACACIONES" | "OTHER";
// };

// export function AdminPendingLeavesPanel({type}: Props) {
//   const { items, loading, refetch } = useAdminPendingLeaves({type});
//   const [processingId, setProcessingId] = useState<string | null>(null);

//   async function approve(id: string) {
//     try {
//       setProcessingId(id);
//       await axiosInstance.post(`/leaves/${id}/approve`);
//       await refetch();
//     } finally {
//       setProcessingId(null);
//     }
//   }

//   async function reject(id: string) {
//     try {
//       setProcessingId(id);
//       await axiosInstance.post(`/leaves/${id}/reject`, {
//         reason: "Rechazado por administración",
//       });
//       await refetch();
//     } finally {
//       setProcessingId(null);
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center py-8">
//         <Loader2 className="animate-spin" />
//       </div>
//     );
//   }

//   if (items.length === 0) {
//     return (
//       <div className="text-center text-muted-foreground py-6">
//         No hay solicitudes pendientes.
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {items.map((leave) => (
//         <div
//           key={leave.id}
//           className="border rounded-lg p-4 flex justify-between items-center"
//         >
//           <div>
//             <div className="font-medium">
//               {leave.user?.nombre} {leave.user?.apellido}
//             </div>
//             <div className="text-sm text-muted-foreground">
//               {leave.type} · {leave.startYmd} → {leave.endYmd} · {leave.daysCount} días
//             </div>
//           </div>

//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               onClick={() => approve(leave.id)}
//               disabled={processingId === leave.id}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               {processingId === leave.id ? (
//                 <Loader2 className="animate-spin w-4 h-4" />
//               ) : (
//                 <Check className="w-4 h-4" />
//               )}
//             </Button>

//             <Button
//               size="sm"
//               variant="destructive"
//               onClick={() => reject(leave.id)}
//               disabled={processingId === leave.id}
//             >
//               <X className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
