'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import useSWR from 'swr';
import type { Menu } from '@/services/access/api';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Routes that are always accessible once logged in
const WHITELIST = [
  '/dashboard/default',
  '/dashboard/no-access',
  '/dashboard/profile',
];

/**
 * RouteGuard checks the current pathname against the DYNAMIC menu registry
 * and kicks the user to /dashboard/default if they don't have access. 
 */
export function RouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading: isSessionLoading } = useSession();
  
  // Fetch only authorized menus for current user
  const { data: authorizedMenus, isLoading: isMenusLoading } = useSWR('/api/menus', fetcher);

  const flatAuthorizedUrls = useMemo(() => {
    if (!authorizedMenus || !Array.isArray(authorizedMenus)) return [];
    
    const urls: string[] = [];
    (authorizedMenus as Menu[]).forEach((group) => {
      if (group.url) urls.push(group.url);
      if (group.children) {
        group.children.forEach((child) => {
          if (child.url) urls.push(child.url);
        });
      }
    });
    return urls;
  }, [authorizedMenus]);

  useEffect(() => {
    if (isSessionLoading || isMenusLoading || !session?.user) return;

    // 1. Check Whitelist
    const isWhitelisted = WHITELIST.some(url => 
      pathname === url || pathname.startsWith(url + '/')
    );
    if (isWhitelisted) return;

    // 2. Only guard dashboard routes
    if (!pathname.startsWith('/dashboard')) return;

    // 3. Super Admin Bypass
    const isSuperAdmin = session.user.roles?.includes('super_admin');
    if (isSuperAdmin) return;

    // 4. Check against Dynamic Menus
    const hasAccess = flatAuthorizedUrls.some(url => 
      pathname === url || pathname.startsWith(url + '/')
    );

    if (!hasAccess) {
      console.warn(`[RouteGuard] Access denied to ${pathname}, redirecting...`);
      router.replace('/dashboard/default');
    }

  }, [pathname, session, isSessionLoading, isMenusLoading, flatAuthorizedUrls, router]);

  return null;
}
