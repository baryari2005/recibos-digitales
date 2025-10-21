export type Receipt = {
  id: string;
  cuil: string;
  period: string;       // "MM-YYYY"
  periodDate: string;   // ISO
  filePath: string;
  fileUrl: string | null;
  viewUrl?: string | null; // firmado si bucket privado
  viewVersion?: number;    // para forzar refresh del visor
  signed: boolean;
  signedDisagreement: boolean;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiResponse = { ok: true; cuil: string; pending: Receipt[]; signed: Receipt[] };
export type TabKey = "pending" | "signed";
