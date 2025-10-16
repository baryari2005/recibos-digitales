// src/app/(auth)/logout/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";

export default function Logout() {
  const { logout } = useAuth();
  const router = useRouter();
  useEffect(() => { logout(); router.replace("/login"); }, [logout, router]);
  return null;
}
