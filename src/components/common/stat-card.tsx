import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('p-6 bg-card/50 backdrop-blur-sm border-border/50', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="h-9 w-9 border border-border/50 rounded-xl bg-muted/30 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
        {trend && (
          <p className="mt-1 text-xs flex items-center gap-1 font-medium">
            <span
              className={
                trend.value > 0
                  ? 'text-emerald-500'
                  : trend.value < 0
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }
            >
              {trend.value > 0 ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </p>
        )}
      </div>
    </Card>
  );
}
