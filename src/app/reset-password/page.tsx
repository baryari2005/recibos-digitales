"use client";

import { ResetPasswordGate } from "@/components/auth/ResetPasswordGate";
import { useSearchParams } from "next/navigation";


export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const token = sp.get("token") || "";

  return <ResetPasswordGate token={token} />;
}
