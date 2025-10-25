// components/dashboard/types.ts
import { ReactNode } from "react";

export type Stat = {
  id: string;
  labelTop: string;
  labelBottom: string;
  value: number | string;
  iconName: "Palmtree" | "FileSignature" | "ClipboardList" | "Plane" | "Gift" | "Default";
  href?: string;                 // opcional: navegar con Link
  onClick?: () => void;          // opcional: handler custom
  disabled?: boolean;
  disabledHint?: string;
};

export type OrgMember = {
  initials: string;
  name: string;
  role: string;
};
