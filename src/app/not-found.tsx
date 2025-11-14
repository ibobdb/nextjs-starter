'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div
      className="flex h-dvh flex-col items-center justify-center space-y-2 text-center
                    bg-white text-gray-800 
                    dark:bg-neutral-950 dark:text-gray-100 transition-colors duration-300"
    >
      <h1 className="text-2xl font-semibold">Page not found.</h1>
      <p className="text-muted-foreground dark:text-gray-400">
        The page you are looking for could not be found.
      </p>
      <Link replace href="/dashboard/default">
        <Button
          variant="outline"
          className="dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Go back home
        </Button>
      </Link>
    </div>
  );
}
