import {
  Home,
  Inbox,
  User2,
  Users,
  Accessibility,
  BarChart,
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
    items: [
      {
        title: 'Default',
        url: '/dashboard/default',
        icon: Home,
        roles: ['super_admin', 'admin', 'manager'],
      },
      {
        title: 'Analytics',
        url: '/dashboard/analytics',
        icon: BarChart,
        roles: ['super_admin', 'admin', 'manager'],
      },
      {
        title: 'Activity Logs',
        url: '/dashboard/logs',
        icon: Inbox,
        roles: ['super_admin', 'admin', 'manager'],
      },
    ],
    roles: ['super_admin', 'admin', 'manager'],
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
            roles: ['super_admin', 'admin', 'manager'],
          },
          {
            title: 'User Roles & Permissions',
            url: '/dashboard/users/permission',
            roles: ['super_admin', 'admin', 'manager'],
          },
          {
            title: 'User Activity',
            url: '/dashboard/users/activity',
            roles: ['super_admin', 'admin', 'manager'],
          },
        ],
        roles: ['super_admin', 'admin', 'manager'],
      },
      {
        title: 'Teams / Groups',
        url: '/dashboard/teams',
        icon: Users,
        roles: ['super_admin', 'admin', 'manager'],
      },
      {
        title: 'Test Page',
        url: '/dashboard/test',
        icon: Users,
        roles: ['super_admin', 'admin', 'manager'],
      },
      {
        title: 'Access Control',
        url: '/dashboard/access',
        icon: Accessibility,
        roles: ['super_admin', 'admin', 'manager'],
      },
    ],
  },
];
