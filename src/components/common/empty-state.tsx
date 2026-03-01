import { cn } from '@/lib/utils';
import { PackageOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * EmptyState — Consistent empty data state (DBStudio Base)
 *
 * Menggantikan inline empty message yang berbeda-beda di setiap komponen.
 * Gunakan di dalam tabel, list, atau konten yang bisa kosong.
 *
 * @example
 * <EmptyState
 *   title="Tidak ada data"
 *   description="Coba ubah filter atau tambahkan data baru."
 *   action={<Button>Tambah</Button>}
 * />
 */

interface EmptyStateProps {
  /** Icon lucide-react (default: PackageOpen) */
  icon?: LucideIcon;
  /** Judul pesan kosong */
  title: string;
  /** Deskripsi tambahan */
  description?: string;
  /** Action button/link */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-14 px-6 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
        <Icon className="h-7 w-7 text-muted-foreground/60" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
