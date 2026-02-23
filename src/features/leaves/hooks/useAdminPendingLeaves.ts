"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export type AdminPendingLeave = {
    id: string;
    type: string;
    startYmd: string;
    endYmd: string;
    daysCount: number;
    createdAt: string;
    user: {
        id: string;
        nombre: string | null;
        apellido: string | null;
        email: string;
    } | null;
};

type Params = {
  type?: "VACACIONES" | "OTHER";
};

export function useAdminPendingLeaves(params?: Params) {
    const [items, setItems] = useState<AdminPendingLeave[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    const query = params?.type
    ? `/api/admin/leaves/pending?type=${params.type}`
    : "/api/admin/leaves/pending";

    async function fetchLeaves() {
        const { data } = await axios.get(query, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        setItems(data.data);
        setLoading(false);
    }

    useEffect(() => {
        fetchLeaves();
        const interval = setInterval(fetchLeaves, 20000);
        return () => clearInterval(interval);
    }, []);

    return { items, loading, refetch: fetchLeaves };
}
