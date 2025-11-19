'use client';

import { useRole } from '../hooks/useRole';

export function Role({
  role,
  children,
}: {
  role: string[];
  children: React.ReactNode;
}) {
  const allowed = useRole(role);

  if (!allowed) return null;

  return <>{children}</>;
}
