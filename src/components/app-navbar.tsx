'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ProfileButton } from './profile-button';
export function AppNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <SidebarTrigger className="shrink-0" />
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            className="w-full pl-9 pr-16 h-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
            <span className="text-xs">⌘</span>J
          </kbd>
        </div>

        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ProfileButton />
        </div>
      </div>
    </header>
  );
}
