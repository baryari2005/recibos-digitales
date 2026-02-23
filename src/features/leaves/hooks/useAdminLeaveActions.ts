// "use client";

// import { axiosInstance } from "@/lib/axios";



// export function useAdminLeaveActions() {
//   async function approveLeave(id: string) {
//     await axiosInstance.post(`/leaves/${id}/approve`);
//   }

//   async function rejectLeave(id: string, reason: string) {
//     await axiosInstance.post(`/leaves/${id}/reject`, { reason });
//   }

//   return {
//     approveLeave,
//     rejectLeave,
//   };
// }
