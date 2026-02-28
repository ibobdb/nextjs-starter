import {
  Home,
  Telescope,
  TrendingUp,
  Users,
  ShieldCheck,
  User2,
  Cpu,
  Database,
  Settings,
  Newspaper,
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: NavItem[];
  roles: string[];
}
interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  subItem?: SubItem[];
  disable?: false | true;
  roles: string[];
}
interface SubItem {
  title: string;
  url: string;
  disable?: false | true;
  roles: string[];
}

export const items: NavGroup[] = [
  {
    label: 'Dashboard',
    roles: ['super_admin', 'admin', 'manager'],
    items: [
      {
        title: 'Default',
        url: '/dashboard/default',
        icon: Home,
        roles: ['super_admin', 'admin', 'manager'],
      },
    ],
  },
  {
    label: 'Trendscout',
    roles: ['super_admin', 'admin', 'manager'],
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
  {
    label: 'User & Access',
    roles: ['super_admin'],
    items: [
      {
        title: 'Users',
        url: '/dashboard/users',
        icon: User2,
        subItem: [
          {
            title: 'Create',
            url: '/dashboard/users/create',
            roles: ['super_admin'],
          },
          {
            title: 'Roles & Permissions',
            url: '/dashboard/users/permission',
            roles: ['super_admin'],
          },
          {
            title: 'Activity',
            url: '/dashboard/users/activity',
            roles: ['super_admin'],
          },
        ],
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
    ],
  },
];
