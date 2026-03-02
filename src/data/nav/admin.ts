/**
 * nav/admin.ts — Admin / User & Access navigation (DBStudio Base)
 * Grup navigasi untuk super_admin: user management dan access control.
 */

import { User2, Users, ShieldCheck, Blocks, Megaphone } from 'lucide-react';
import type { NavGroup } from './types';

export const adminNav: NavGroup[] = [
  {
    label: 'User & Access',
    roles: ['super_admin', 'admin'],
    permission: 'user.read',
    items: [
      {
        title: 'Users',
        url: '/dashboard/users',
        icon: User2,
        roles: ['super_admin', 'admin'],
        permission: 'user.read'
      },
      {
        title: 'Teams',
        url: '/dashboard/teams',
        icon: Users,
        roles: ['super_admin', 'admin'],
        permission: 'team.read'
      },
      {
        title: 'Access Control',
        url: '/dashboard/access',
        icon: ShieldCheck,
        roles: ['super_admin', 'admin'],
        permission: 'access.read'
      },
      {
        title: 'Modules Registry',
        url: '/dashboard/modules',
        icon: Blocks,
        roles: ['super_admin', 'admin'],
        permission: 'module.read'
      },
      {
        title: 'System Broadcast',
        url: '/dashboard/broadcast',
        icon: Megaphone,
        roles: ['super_admin', 'admin'],
        permission: 'broadcast.read'
      },
    ],
  },
];
