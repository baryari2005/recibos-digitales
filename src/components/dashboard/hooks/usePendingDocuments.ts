// // components/dashboard/hooks/usePendingDocuments.ts
// "use client";

// import { useEffect, useState } from "react";
// import { axiosInstance } from "@/lib/axios";

// function yyyyMm(d = new Date()) {
//   return d.toISOString().slice(0, 7);
// }

// export function usePendingDocuments(period = yyyyMm()) {
//   const [count, setCount] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       try {
//         await axiosInstance.get("/payroll/my-doc", { params: { period } });
//         if (!alive) return;
//         setCount(1); // 200 => hay doc pendiente
//       } catch (err: any) {
//         // 404 => no hay documento
//         if (!alive) return;
//         setCount(0);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [period]);

//   return { count, loading };
// }

// components/dashboard/hooks/usePendingDocuments.ts
"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";

function yyyyMm(d = new Date()) {
  return d.toISOString().slice(0, 7);
}

export function usePendingDocuments(period = yyyyMm()) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/payroll/pending/all");
        if (!alive) return;
        setCount(Number(res.data?.count ?? 0));
      } catch {
        if (!alive) return;
        setCount(0);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [period]);

  return { count, loading };
}
