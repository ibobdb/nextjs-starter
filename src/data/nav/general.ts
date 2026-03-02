/**
 * nav/general.ts — General dashboard navigation (DBStudio Base)
 * Grup navigasi yang tersedia untuk semua role dasar.
 */

import { Home } from 'lucide-react';
import type { NavGroup } from './types';

export const generalNav: NavGroup[] = [
  {
    label: 'Dashboard',
    roles: ['super_admin', 'admin', 'user'],
    items: [
      {
        title: 'Default',
        url: '/dashboard/default',
        icon: Home,
        roles: ['super_admin', 'admin', 'user'],
      },
    ],
  },
];
