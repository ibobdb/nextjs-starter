import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * PageHeader — Consistent page header (DBStudio Base)
 *
 * Menggantikan inline page-header markup yang berbeda-beda di setiap page.
 * Semua halaman baru harus menggunakan komponen ini.
 *
 * @example
 * <PageHeader
 *   title="Topic & Trends"
 *   description="Review trending keywords dan manage topic candidates."
 *   actions={<Button>Evaluate All</Button>}
 * />
 *
 * @example dengan icon
 * <PageHeader icon={Database} title="Data Sources" description="..." />
 */

interface PageHeaderProps {
  /** Judul halaman — satu baris, singkat */
  title: string;
  /** Deskripsi singkat di bawah judul */
  description?: string;
  /** Icon dari lucide-react (opsional) */
  icon?: LucideIcon;
  /** Action buttons/controls di kanan header */
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3',
        className
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="mt-0.5 h-9 w-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-primary" size={18} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight truncate">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
