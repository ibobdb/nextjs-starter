import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ErrorState — Consistent error/failed fetch state (DBStudio Base)
 *
 * Render ketika data fetch gagal. Selalu sediakan tombol retry
 * agar user tidak perlu hard-refresh halaman.
 *
 * @example
 * <ErrorState
 *   title="Gagal memuat data"
 *   description={error.message}
 *   onRetry={refetch}
 * />
 */

interface ErrorStateProps {
  /** Judul error (default: "Gagal memuat data") */
  title?: string;
  /** Pesan detail, bisa dari error.message */
  description?: string;
  /** Callback saat tombol Retry diklik */
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Gagal memuat data',
  description = 'Terjadi kesalahan saat memuat data. Coba lagi.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-14 px-6 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive/70" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>
      )}
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2"
          onClick={onRetry}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
