export type StatusFilter = "all" | "signed" | "unsigned" | "disagreement";

export type ReceiptStatus = "FIRMADO" | "DISCONFORMIDAD" | "PENDIENTE";

export type UserSlim = {
  id: string;
  userId: string | null;
  email: string | null;
  nombre: string | null;
  apellido: string | null;
  cuil: string | null;
};

export type ReceiptSlim = {
  id: string;
  cuil: string;
  period: string;
  periodDate: Date;
  fileUrl: string | null;
  filePath: string;
  signed: boolean;
  signedDisagreement: boolean;
  observations: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ReceiptWithStatus = ReceiptSlim & {
  status: ReceiptStatus;
};

export type GroupedPayrollReceipts = {
  cuil: string;
  user: UserSlim | null;
  receipts: ReceiptWithStatus[];
};