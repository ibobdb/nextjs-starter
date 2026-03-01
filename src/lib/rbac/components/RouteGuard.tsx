'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { items } from '@/data/siderbar';
import { useRole } from '@/lib/rbac/hooks/useRole';
import { usePermission } from '@/lib/rbac/hooks/usePermission';
import { useSession } from '@/hooks/use-session';
import { useModules } from '@/hooks/use-modules';

/**
 * RouteGuard checks the current pathname against the sidebar registry
 * and kicks the user to /dashboard/default if they no longer have access. 
 */
export function RouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading: isSessionLoading } = useSession();
  const { isModuleActive, getModuleRecord, isLoading: isModulesLoading } = useModules();

  // Mute guard during session load to prevent flash of unauthorized
  useEffect(() => {
    // We need both session and modules state to be ready to properly determine access.
    if (isSessionLoading || isModulesLoading || !session?.user) return;

    // 1. Find the group or item that matches the current pathname
    // (A simple prefix match is enough for our structure)
    let matchedGroup = null;
    let matchedItem = null;

    for (const group of items) {
      for (const item of group.items) {
        if (pathname === item.url || pathname.startsWith(item.url + '/')) {
          matchedGroup = group;
          matchedItem = item;
          break;
        }
      }
      if (matchedItem) break;
    }

    if (!matchedGroup && !matchedItem) {
      // Route is not in sidebar registry (e.g. /dashboard/profile), allow it
      return; 
    }

    // --- MODULE REGISTRY CHECK ---
    // If the matched group is attached to a module, ensure it's active.
    if (matchedGroup?.moduleId) {
      const active = isModuleActive(matchedGroup.moduleId);
      if (!active) {
        console.warn(`[RouteGuard] Module ${matchedGroup.moduleId} is offline. Redirecting from ${pathname}...`);
        const modRecord = getModuleRecord(matchedGroup.moduleId);
        // Build url safely passing module name to unavailable page if possible
        const targetUrl = modRecord 
          ? `/dashboard/unavailable?module=${encodeURIComponent(modRecord.name)}` 
          : `/dashboard/unavailable`;
        router.replace(targetUrl);
        return; // Halt further RBAC checks
      }
    }

    // 2. Extract requirements
    const userRoles = session.user.roles ?? [];
    const userPerms = session.user.permissions ?? [];

    const requiredGroupRoles = matchedGroup?.roles;
    const requiredGroupPerm = matchedGroup?.permission;

    // 3. Fallback logic: check group then item
    let hasAccess = true;

    // --- SUPER_ADMIN BYPASS ---
    // If the user is a super admin, they have absolute access to the UI.
    // This prevents chicken-and-egg lockouts when new permissions are introduced.
    if (!userRoles.includes('super_admin')) {
      // Check Group Level Roles
      if (requiredGroupRoles && requiredGroupRoles.length > 0) {
        if (!requiredGroupRoles.some(r => userRoles.includes(r))) {
          hasAccess = false;
        }
      }

      // Check Group Level Permission
      if (hasAccess && requiredGroupPerm) {
        if (!userPerms.includes(requiredGroupPerm)) {
          hasAccess = false;
        }
      }

      // Check Item Level Roles (if group allowed us through)
      if (hasAccess && matchedItem?.roles && matchedItem.roles.length > 0) {
        if (!matchedItem.roles.some(r => userRoles.includes(r))) {
          hasAccess = false;
        }
      }

      // Check Item Level Permission (if they exist in future configs)
      if (hasAccess && (matchedItem as any).permission) {
        if (!userPerms.includes((matchedItem as any).permission)) {
          hasAccess = false;
        }
      }
    }

    // 4. Redirect if unauthorized
    if (!hasAccess) {
      console.warn(`[RouteGuard] Access denied to ${pathname}, redirecting...`);
      router.replace('/dashboard/default');
    }

  }, [pathname, session, isSessionLoading, isModulesLoading, router, isModuleActive, getModuleRecord]);

  return null;
}
