import {
  Beaker,
} from 'lucide-react';
import type { NavGroup } from './types';

export const labNav: NavGroup[] = [
  {
    label: 'Testing / Lab',
    roles: ['super_admin', 'admin'],
    permission: 'admin.read',
    items: [
      {
        title: 'Integration Lab',
        url: '/dashboard/lab',
        icon: Beaker,
        roles: ['super_admin', 'admin'], 
        permission: 'admin.read'
      },
    ],
  },
];
