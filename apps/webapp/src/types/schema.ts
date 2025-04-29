export type AllocationType = 'amount' | 'percentage' | 'overflow';

export interface Allocation {
  category: string;
  type: AllocationType;
  value: number;
  priority: number;
}
