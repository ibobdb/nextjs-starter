import {
  Home,
  Inbox,
  User2,
  Users,
  Accessibility,
  ShoppingCart,
  Package,
  Settings,
  BarChart,
  Bell,
  MessageSquare,
  CreditCard,
  Database,
  ShieldCheck,
} from 'lucide-react';
interface NavGroup {
  label: string;
  items: NavItem[];
}
interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  subItem?: SubItem[];
  disable?: false | true;
}
interface SubItem {
  title: string;
  url: string;
  disable?: false | true;
}
export const items: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [
      { title: 'Default', url: '/dashboard/default', icon: Home },
      { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart },
      { title: 'Activity Logs', url: '/dashboard/logs', icon: Inbox },
    ],
  },
  {
    label: 'User & Access',
    items: [
      {
        title: 'Users',
        url: '/dashboard/users',
        icon: User2,
        subItem: [
          { title: 'Create', url: '/dashboard/users/create' },
          {
            title: 'User Roles & Permissions',
            url: '/dashboard/users/permission',
          },
          { title: 'User Activity', url: '/dashboard/users/activity' },
        ],
      },
      { title: 'Teams / Groups', url: '/dashboard/teams', icon: Users },
      {
        title: 'Access Control',
        url: '/dashboard/access',
        icon: Accessibility,
      },
    ],
  },
  {
    label: 'Business',
    items: [
      {
        title: 'Products / Services',
        url: '/dashboard/products',
        icon: Package,
        subItem: [
          { title: 'Category', url: '/dashboard/products/category' },
          { title: 'Stock', url: '/dashboard/products/stock', disable: true },
          { title: 'Price List', url: '/dashboard/products/pricing' },
        ],
      },
      {
        title: 'Orders / Transactions',
        url: '/dashboard/orders',
        icon: ShoppingCart,
        subItem: [
          { title: 'Orders List', url: '/dashboard/orders/list' },
          { title: 'Payments', url: '/dashboard/orders/payments' },
          { title: 'Refunds', url: '/dashboard/orders/refunds', disable: true },
        ],
      },
      {
        title: 'Customers / Clients',
        url: '/dashboard/customers',
        icon: Users,
      },
    ],
  },
  {
    label: 'System Management',
    items: [
      { title: 'Notifications', url: '/dashboard/notifications', icon: Bell },
      { title: 'Messages', url: '/dashboard/messages', icon: MessageSquare },
      {
        title: 'Settings',
        url: '/dashboard/settings',
        icon: Settings,
        subItem: [
          { title: 'General', url: '/dashboard/settings/general' },
          { title: 'Integrations', url: '/dashboard/settings/integrations' },
          { title: 'Billing', url: '/dashboard/settings/billing' },
        ],
      },
    ],
  },
  {
    label: 'Developer Tools',
    items: [
      {
        title: 'API Management',
        url: '/dashboard/api',
        icon: Database,
        subItem: [
          { title: 'API Keys', url: '/dashboard/api/keys' },
          { title: 'Webhooks', url: '/dashboard/api/webhooks' },
        ],
      },
      {
        title: 'Security',
        url: '/dashboard/security',
        icon: ShieldCheck,
        subItem: [
          { title: 'Audit Trail', url: '/dashboard/security/audit' },
          { title: '2FA Settings', url: '/dashboard/security/2fa' },
        ],
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      {
        title: 'Payments',
        url: '/dashboard/payments',
        icon: CreditCard,
        subItem: [
          { title: 'Incoming', url: '/dashboard/payments/incoming' },
          { title: 'Outgoing', url: '/dashboard/payments/outgoing' },
        ],
      },
      { title: 'Reports', url: '/dashboard/reports', icon: BarChart },
    ],
  },
];
