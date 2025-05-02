import type { Id } from '@workspace/backend/convex/_generated/dataModel'; // Import Id type from Convex

export type AllocationType = 'amount' | 'percentage' | 'overflow';

export interface Allocation {
  _id: string; // Change to string to match the backend
  category: string;
  type: AllocationType;
  value: number;
  priority: number;
  alwaysAdd?: boolean;
}
