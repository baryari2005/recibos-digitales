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

export type Props = {
  refreshToken: number;
  onEdit: (item: VacationBalanceItem) => void;
  onDeleted: (item: VacationBalanceItem) => Promise<void>;
};

export type Params = {
  onEdit: (item: VacationBalanceItem) => void;
  onDeleted: (item: VacationBalanceItem) => Promise<void>;
};