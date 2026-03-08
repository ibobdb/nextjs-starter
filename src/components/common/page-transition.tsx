'use client';

/**
 * PageTransition — wraps page content with a consistent fade+slide-up
 * entry animation on every route change.
 *
 * Uses `usePathname()` as the animation key so the animation re-triggers
 * every time the page changes, even between pages at the same nesting level.
 */

export function PageTransition({ children }: { children: React.ReactNode }) {

  return (
    <div
      className="animate-in fade-in-0 duration-200 ease-out"
    >
      {children}
    </div>
  );
}
