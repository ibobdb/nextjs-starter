'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth-client';

export function usePermission(permission: string) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    getSession().then((session) => {
      if (session?.data?.user.permissions?.includes(permission)) {
        setAllowed(true);
      }
    });
  }, [permission]);

  return allowed;
}
