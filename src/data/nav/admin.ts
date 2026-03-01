/**
 * nav/admin.ts — Admin / User & Access navigation (DBStudio Base)
 * Grup navigasi untuk super_admin: user management dan access control.
 */

import { User2, Users, ShieldCheck, Blocks } from 'lucide-react';
import type { NavGroup } from './types';

export const adminNav: NavGroup[] = [
  {
    label: 'User & Access',
    roles: ['super_admin'],
    items: [
      {
        title: 'Users',
        url: '/dashboard/users',
        icon: User2,
        roles: ['super_admin'],
      },
      {
        title: 'Teams',
        url: '/dashboard/teams',
        icon: Users,
        roles: ['super_admin'],
      },
      {
        title: 'Access Control',
        url: '/dashboard/access',
        icon: ShieldCheck,
        roles: ['super_admin'],
      },
      {
        title: 'Modules Registry',
        url: '/dashboard/modules',
        icon: Blocks,
        roles: ['super_admin'],
      },
    ],
  },
];
