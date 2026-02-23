// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { PendingLeave } from "../hooks/usePendingApprovals";

// import { RejectLeaveDialog } from "./RejectLeaveDialog";
// import { ApproveLeaveDialog } from "./ApproveLeaveDialog";
// import { axiosInstance } from "@/lib/axios";

// type Props = {
//   leave: PendingLeave;
//   onRefresh: () => void;
// };

// export function AdminLeaveActions({ leave, onRefresh }: Props) {
//   const [openReject, setOpenReject] = useState(false);
//   const [openApprove, setOpenApprove] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const token = localStorage.getItem("token");

//   async function approve() {
//     try {
//       setLoading(true);

//       await axiosInstance.post(
//         `/leaves/${leave.id}/approve`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setOpenApprove(false);
//       onRefresh();  // refresca tabla actual
//     }
//     catch (err: any) {
//       console.log("ERROR BACKEND:", err.response?.data);
//       alert(err.response?.data?.error ?? "Error al aprobar");
//     }
//     finally {
//       setLoading(false);
//     }
//   }

//   async function reject(reason: string) {
//     try {
//       setLoading(true);

//       await axiosInstance.post(
//         `/leaves/${leave.id}/reject`,
//         { reason },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setOpenReject(false);
//       onRefresh();
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <>
//       <div className="flex gap-2">
//         <Button
//           size="sm"
//           onClick={() => setOpenApprove(true)}
//           disabled={loading}
//           className="bg-green-600 hover:bg-green-700"
//         >
//           Aprobar
//         </Button>

//         <Button
//           size="sm"
//           variant="outline"
//           onClick={() => setOpenReject(true)}
//           disabled={loading}
//         >
//           Rechazar
//         </Button>
//       </div>

//       <ApproveLeaveDialog
//         open={openApprove}
//         onOpenChange={setOpenApprove}
//         onConfirm={approve}
//         loading={loading}
//       />

//       <RejectLeaveDialog
//         open={openReject}
//         onOpenChange={setOpenReject}
//         onConfirm={reject}
//         loading={loading}
//       />
//     </>
//   );
// }
