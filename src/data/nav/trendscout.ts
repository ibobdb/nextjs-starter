/**
 * nav/trendscout.ts — TrendScout module navigation (DBStudio Base)
 * Semua item nav untuk modul TrendScout.
 * Menambahkan modul baru = buat file baru di sini, lalu import di siderbar.ts.
 */

import {
  Telescope,
  TrendingUp,
  Cpu,
  Database,
  Newspaper,
  Settings,
} from 'lucide-react';
import type { NavGroup } from './types';

export const trendscoutNav: NavGroup[] = [
  {
    label: 'TrendScout',
    roles: ['super_admin', 'admin', 'manager'],
    permission: 'trendscout.read',
    moduleId: 'trendscout',
    items: [
      {
        title: 'Discovery',
        url: '/dashboard/trendscout/discovery',
        icon: Telescope,
        roles: ['super_admin', 'admin', 'manager'],
      },
      {
        title: 'Topic & Trends',
        url: '/dashboard/trendscout/topic-trends',
        icon: TrendingUp,
        roles: ['super_admin', 'admin', 'manager'],
      },
      {
        title: 'Clustering',
        url: '/dashboard/trendscout/clustering',
        icon: Cpu,
        roles: ['super_admin', 'admin', 'manager'],
      },
      {
        title: 'Datasources',
        url: '/dashboard/trendscout/datasources',
        icon: Database,
        roles: ['super_admin', 'admin', 'manager'],
      },
      {
        title: 'Content',
        url: '/dashboard/trendscout/content',
        icon: Newspaper,
        roles: ['super_admin', 'admin', 'manager'],
      },
      {
        title: 'Settings',
        url: '/dashboard/trendscout/settings',
        icon: Settings,
        roles: ['super_admin', 'admin', 'manager'],
      },
    ],
  },
];
