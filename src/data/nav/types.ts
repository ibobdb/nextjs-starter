/**
 * nav/types.ts — Shared navigation types (DBStudio Base)
 * Type definitions untuk struktur nav item di seluruh aplikasi.
 */

export interface SubItem {
  title: string;
  url: string;
  disable?: boolean;
  roles: string[];
}

export interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  subItem?: SubItem[];
  disable?: boolean;
  roles: string[];
  /** Permission yang dibutuhkan untuk melihat item ini */
  permission?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  roles: string[];
  /** Permission yang dibutuhkan untuk melihat seluruh grup ini */
  permission?: string;
  /** Status ID Modul untuk ngecek flag online/offline global */
  moduleId?: string;
}
