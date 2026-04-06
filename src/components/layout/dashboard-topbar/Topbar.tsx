"use client";


import Image from "next/image";
import { UserMenu } from "@/components/layout/user-menu";
import { Logo } from "@/components/ui/logo";

export function Topbar() {
  return (
    <header
      className="
        h-[var(--topbar-h)] bg-white border-b
        px-[var(--content-pad)]
        w-full flex items-center justify-between
      "
    >
      <div className="flex items-center gap-3">
        <Logo />
      </div>

      <div className="flex items-center gap-3 w-full flex-1 justify-end">
        <div className="flex items-center gap-2">
          <Image
            src="/coi.png"
            alt="Centro de Ojos Ituzaingó"
            width={30}
            height={30}
            className="rounded"
            priority
          /> 
          <span className="font-medium text-right">
            Centro de Ojos Ituzaingó S.A.
          </span>
          {/* <Image
            src="/centrodeojos.png"
            alt="Centro de Ojos Ituzaingó"
            width={400}
            height={50}
            className="rounded"
            priority
          /> */}
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
