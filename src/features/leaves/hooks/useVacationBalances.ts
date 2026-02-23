export type VacationBalanceItem = {
  id: string;
  year: number;
  totalDays: number;
  usedDays: number;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    legajo?: {
      numeroLegajo: string;
    } | null;
  };
};
