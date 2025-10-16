// components/Logo.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export function Logo() {
  const router = useRouter();

  const logoR = "/r.png";
  const logoRecibo = "/recibo2.png";

  return (
    <div
      role="link"
      aria-label="Go to home"
      className="h-20 w-full flex items-center justify-center px-6 cursor-pointer gap-2"
      onClick={() => router.push("/")}
    >
      <Image src={logoR} alt="Logo R" width={30} height={30} className="rounded-lg" priority />
      <Image src={logoRecibo} alt="Recibo Digital" width={130} height={30} className="rounded-lg" priority />
    </div>
  );
}
