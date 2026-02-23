"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

type Props = {
  code: "403" | "404" | "501";
  title: string;
  description?: string;
  imageSrc: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

export function StatusPage({
  code,
  title,
  description,
  imageSrc,
  primaryAction = { label: "Volver al inicio", href: "/" },
  secondaryAction,
}: Props) {
  return (
    <div className="w-full h-full min-h-[60vh] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl grid gap-10 md:grid-cols-2 items-center">
        <div className="flex justify-center">
          <div className="relative w-[320px] h-[240px] md:w-[420px] md:h-[320px]">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div>
          <div className="text-6xl font-extrabold tracking-tight">{code}</div>
          <h1 className="mt-2 text-2xl font-semibold">{title}</h1>

          {description ? (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              asChild
              className="h-11 rounded bg-[#008C93] hover:bg-[#007381]"
            >
              <Link href={primaryAction.href} className="inline-flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>{primaryAction.label}</span>
              </Link>
            </Button>

            {secondaryAction ? (
              <Button asChild variant="outline">
                <Link href={secondaryAction.href}>
                  {secondaryAction.label}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}