// components/dashboard/types.ts
import { ReactNode } from "react";

export type Stat = {
  id: string;
  labelTop: string;
  labelBottom: string;
  value: number | string;
  iconName: "FileSignature" | "ClipboardList" | "Plane" | "Gift" | "Default";
};

export type OrgMember = {
  initials: string;
  name: string;
  role: string;
};
