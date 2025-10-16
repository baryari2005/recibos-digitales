export type DocItem = {
  id: string;
  title: string;
  period: string; // "YYYY-MM"
  status: "PENDIENTE" | "FIRMADO";
  url?: string | null;
};
