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
  // Green (Success)
  approved: 'bg-success/10 text-success border-success/20',
  active:   'bg-success/10 text-success border-success/20',
  success:  'bg-success/10 text-success border-success/20',
  online:   'bg-success/10 text-success border-success/20',
  running:  'bg-success/10 text-success border-success/20',
  done:     'bg-success/10 text-success border-success/20',

  // Red (Destructive)
  rejected:  'bg-destructive/10 text-destructive border-destructive/20',
  error:     'bg-destructive/10 text-destructive border-destructive/20',
  failed:    'bg-destructive/10 text-destructive border-destructive/20',
  offline:   'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',

  // Amber (Warning)
  pending: 'bg-warning/10 text-warning border-warning/20',
  waiting: 'bg-warning/10 text-warning border-warning/20',
  queued:  'bg-warning/10 text-warning border-warning/20',

  // Blue (Info)
  generated:  'bg-info/10 text-info border-info/20',
  processing: 'bg-info/10 text-info border-info/20',
  evaluating: 'bg-info/10 text-info border-info/20',
  draft:      'bg-info/10 text-info border-info/20',

  // Slate (Muted)
  ignored:  'bg-muted/50 text-muted-foreground border-border',
  skipped:  'bg-muted/50 text-muted-foreground border-border',
  disabled: 'bg-muted/50 text-muted-foreground border-border',
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
