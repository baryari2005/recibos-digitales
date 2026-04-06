export type ReceiptStatus = "FIRMADO" | "DISCONFORMIDAD" | "PENDIENTE";

export type ReceiptFilterStatus =
  | "all"
  | "signed"
  | "unsigned"
  | "disagreement";

export type ApiGroup = {
  cuil: string;
  user: {
    id: string;
    userId: string | null;
    email: string;
    nombre: string | null;
    apellido: string | null;
    cuil: string | null;
  } | null;
  receipts: {
    id: string;
    period: string;
    periodDate: string;
    fileUrl: string;
    filePath: string;
    signed: boolean;
    signedDisagreement: boolean;
    observations: string | null;
    createdAt: string;
    updatedAt: string;
    status: ReceiptStatus;
  }[];
};

export type ApiResponse = {
  summary: {
    totals: number;
    signed: number;
    disagreement: number;
    unsigned: number;
    coverage: string;
  };
  groups: ApiGroup[];
};

export type ReceiptsQueryParams = {
  q?: string;
  status?: ReceiptFilterStatus;
  from?: string;
  to?: string;
};