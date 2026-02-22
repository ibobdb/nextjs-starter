'use client';

import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GrowthSummary {
  sourceId: number;
  _sum: {
    itemsCreated: number;
  };
  _count: {
    id: number;
  };
}

interface GrowthMetricsChartProps {
  data: GrowthSummary[];
  loading: boolean;
}

const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'];

const SOURCE_MAP: Record<number, string> = {
  1: 'GitHub',
  2: 'StackOverflow',
  3: 'Hacker News',
  4: 'Dev.to',
  5: 'Reddit',
  6: 'npm',
  7: 'PyPI',
  8: 'GitLab',
  9: 'Bitbucket',
};

export function GrowthMetricsChart({ data, loading }: GrowthMetricsChartProps) {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data
      .map(item => ({
        sourceId: item.sourceId,
        name: SOURCE_MAP[item.sourceId] || `Source ${item.sourceId}`,
        itemsCreated: item._sum?.itemsCreated || 0,
        runCount: item._count?.id || 0
      }))
      .sort((a, b) => b.itemsCreated - a.itemsCreated);
  }, [data]);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group">
      <CardHeader>
        <CardTitle>Ingestion by Source</CardTitle>
        <CardDescription>Aggregate items discovered per data source.</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] px-2">
        {loading ? (
          <div className="w-full h-full bg-muted/20 animate-pulse rounded-md" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.1} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false}
                tickLine={false}
                fontSize={12}
                width={100}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  border: 'none'
                }}
              />
              <Bar 
                dataKey="itemsCreated" 
                radius={[0, 4, 4, 0]}
                barSize={24}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground italic">
            No source data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
