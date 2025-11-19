'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth-client';

export function useRole(requiredRoles: string | string[]) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    getSession().then((session) => {
      const userRoles = session?.data?.user.roles ?? [];
      const required = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      const hasRole = required.some((role) => userRoles.includes(role));

      setAllowed(hasRole);
    });
  }, [requiredRoles]);

  return allowed;
}
