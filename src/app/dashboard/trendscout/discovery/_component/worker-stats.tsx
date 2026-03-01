'use client'
import { TrendingUp, TrendingDown } from 'lucide-react';
import useSWR from 'swr';
import { Badge } from '@/components/ui/badge';
import { DataLoader } from '@/components/common/data-loader';
import { statsApi } from '@/services/ts-worker/api/stats';
import {
  Card,
  CardAction,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';

const fetchSummary = () => statsApi.getSummary().then((res) => {
  if (res.success && res.data) return res.data;
  throw new Error('Failed to fetch summary');
});

export function SectionCards() {
  const { data: stats, isLoading } = useSWR('ts-worker/stats/summary', fetchSummary, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10_000,
  });

  if (isLoading) {
    return <DataLoader isLoading={isLoading} skeletonVariant="stat-cards" skeletonProps={{ count: 4 }} />
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/main">
        <CardHeader>
          <CardDescription>Candidate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.counts.candidates ?? '—'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Trend</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.counts.trends ?? '—'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cluster</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.counts.clusters ?? '—'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Items Ingested</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.counts.totalItemsIngested ?? '—'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className={`@container/card`}>
        <CardHeader>
          <CardDescription>NLP Backlog</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.queue.nlpBacklog ?? '—'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className={`@container/card ${stats?.queue.pendingEvaluations != null && stats?.queue.pendingEvaluations > 0 ? 'border-b border-primary' : ''}`}>
        <CardHeader>
          <CardDescription>Pending Evaluations</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.queue.pendingEvaluations ?? '—'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className={`${stats?.queue.activeBackgroundJobs != null && stats?.queue.activeBackgroundJobs > 0 ? 'border-b border-primary' : ''}`}>
        <CardHeader>
          <CardDescription>Active Background Jobs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.queue.activeBackgroundJobs ?? '—'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
