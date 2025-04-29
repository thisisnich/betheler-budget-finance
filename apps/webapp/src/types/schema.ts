export type AllocationType = 'amount' | 'percentage' | 'overflow';

export interface Allocation {
  _id?: string; // Optional because it may not exist when creating a new allocation
  category: string;
  type: AllocationType;
  value: number;
  priority: number;
}
