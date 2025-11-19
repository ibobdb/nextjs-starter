// lib/auth-types.ts
import { auth } from '@/lib/auth';

// Extract base types
type BaseSession = Awaited<ReturnType<typeof auth.api.getSession>>;

// Extend dengan custom fields
export type ExtendedUser = NonNullable<BaseSession>['user'] & {
  roles: string[];
  permissions: string[];
};

export type ExtendedSession = Omit<NonNullable<BaseSession>, 'user'> & {
  user: ExtendedUser;
};
