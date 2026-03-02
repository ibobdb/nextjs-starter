import { Settings } from 'lucide-react';
import type { NavGroup } from './types';

export const systemNav: NavGroup[] = [
  {
    label: 'System Configuration',
    roles: ['super_admin', 'admin'],
    permission: 'settings.read',
    items: [
      {
        title: 'System Settings',
        url: '/dashboard/settings/system',
        icon: Settings,
        roles: ['super_admin', 'admin'],
        permission: 'settings.read'
      },
    ],
  },
];
