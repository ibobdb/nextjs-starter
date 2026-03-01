import {
  Beaker,
  TestTube,
} from 'lucide-react';
import type { NavGroup } from './types';

export const labNav: NavGroup[] = [
  {
    label: 'Testing / Lab',
    roles: ['super_admin', 'admin'],
    permission: 'settings.read',
    moduleId: 'lab', // We can define a virtual module or just leave it
    items: [
      {
        title: 'Integration Lab',
        url: '/dashboard/lab',
        icon: Beaker,
        roles: ['super_admin', 'admin'], 
      },
    ],
  },
];
