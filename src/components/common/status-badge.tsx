import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * StatusBadge — Consistent status coloring (DBStudio Base)
 *
 * Memusatkan logic warna badge berdasarkan status string.
 * Menggantikan inline className logic yang tersebar di setiap tabel.
 *
 * Status yang di-support:
 * - approved, active, success, online, running → emerald
 * - rejected, error, failed, offline, cancelled → rose
 * - pending, waiting, queued → amber
 * - generated, processing, evaluating → blue
 * - ignored, skipped, disabled → slate
 * - Lainnya → default (muted)
 *
 * @example
 * <StatusBadge status="approved" />
 * <StatusBadge status="rejected" />
 * <StatusBadge status={candidate.status} className="text-xs" />
 */

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_MAP: Record<string, string> = {
  // Green
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  active:   'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  success:  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  online:   'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  running:  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  done:     'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',

  // Red
  rejected:  'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
  error:     'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
  failed:    'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
  offline:   'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
  cancelled: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',

  // Amber
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  waiting: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  queued:  'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',

  // Blue
  generated:  'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  evaluating: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  draft:      'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',

  // Slate
  ignored:  'bg-slate-500/10 text-slate-500 border-slate-500/20',
  skipped:  'bg-slate-500/10 text-slate-500 border-slate-500/20',
  disabled: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status?.toLowerCase() ?? '';
  const colorClass = STATUS_MAP[key] ?? 'bg-muted text-muted-foreground border-border';

  return (
    <Badge
      variant="outline"
      className={cn('capitalize font-medium text-[11px] px-2 py-0.5', colorClass, className)}
    >
      {status}
    </Badge>
  );
}
