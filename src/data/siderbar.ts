/**
 * siderbar.ts — Sidebar navigation aggregator (DBStudio Base)
 *
 * File ini adalah central registry untuk semua nav group.
 * Untuk menambah modul baru:
 *   1. Buat file baru di src/data/nav/[module-name].ts
 *   2. Import dan tambahkan ke array `items` di bawah
 *
 * Urutan array menentukan urutan tampil di sidebar.
 */

import { generalNav } from './nav/general';
import { trendscoutNav } from './nav/trendscout';
import { adminNav } from './nav/admin';
import { labNav } from './nav/lab';
import { systemNav } from './nav/system';

import type { NavGroup } from './nav/types';

export const items: NavGroup[] = [
  ...generalNav,
  ...trendscoutNav,
  ...labNav,
  ...adminNav,
  ...systemNav,
];

// Re-export types untuk backward compat
export type { NavGroup, NavItem, SubItem } from './nav/types';

