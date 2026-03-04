'use client';

/**
 * PageTransition — wraps page content with a consistent fade+slide-up
 * entry animation on every route change.
 *
 * Uses `usePathname()` as the animation key so the animation re-triggers
 * every time the page changes, even between pages at the same nesting level.
 */

import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-out"
    >
      {children}
    </div>
  );
}
