export type LeaveTypeItem = {
  id: number;
  code: string;
  label: string;
  colorHex: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    requests: number;
  };
};

export type LeaveTypeUpdate = {
  id: number;
  code: string;
  label: string;
  colorHex: string | null;
  isActive: boolean;
};

export interface LeaveTypesListProps {
  search?: string;
  refresh?: string | number;
}
