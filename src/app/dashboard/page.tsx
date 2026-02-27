'use client';

import { useEffect, useState, useCallback } from 'react';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { GrowthMetricsChart } from '@/components/dashboard/growth-metrics-chart';
import { statsApi } from '@/services/ts-worker/api/stats';
import { SummaryStats, GrowthSummary } from '@/services/ts-worker/types';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [growthData, setGrowthData] = useState<GrowthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);

    try {
      const [summaryRes, growthRes] = await Promise.all([
        statsApi.getSummary(),
        statsApi.getGrowthMetrics()
      ]);

      if (summaryRes.success && summaryRes.data) {
        setStats(summaryRes.data);
      }

      if (growthRes.success && growthRes.data) {
        // The API returns { summary: GrowthSummary[], recent: ... }
        setGrowthData(growthRes.data.summary || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights into your TrendScout pipeline.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchData()} 
          disabled={refreshing}
          className="gap-2 border-border/50 bg-background/50 backdrop-blur-sm"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <SummaryCards stats={stats} loading={loading} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4">
          <GrowthMetricsChart data={growthData} loading={loading} />
        </div>
        <div className="col-span-full lg:col-span-3">
          <div className="h-full border border-dashed rounded-xl flex items-center justify-center text-muted-foreground bg-muted/5 min-h-[350px]">
            <div className="text-center px-4">
              <p className="font-medium text-foreground">Advanced Analytics</p>
              <p className="text-sm">Category breakdown and keyword trends integration coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
