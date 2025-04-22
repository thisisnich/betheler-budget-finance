import type { Doc } from '../../convex/_generated/dataModel';

export type AuthState =
  | {
      state: 'unauthenticated';
      reason: string;
    }
  | {
      state: 'authenticated';
      user: Doc<'users'>;
    };
