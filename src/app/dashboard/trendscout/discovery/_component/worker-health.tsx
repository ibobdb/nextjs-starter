'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { healthCheck } from "@/services/ts-worker/api/health-check";
import { Badge } from "@/components/ui/badge";
import { DataLoader } from "@/components/common/data-loader";
import useSWR from "swr";

const fetchHealth = () => healthCheck().then((res) => {
  if (res.success && res.data) return res.data;
  throw new Error('Failed to fetch health');
});

export default function WorkerHealthComponent() {
  const { data: workerHealth, isLoading } = useSWR('ts-worker/health', fetchHealth, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
    // dedupingInterval: 10_000,
  });

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Worker Health</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataLoader isLoading={true} skeletonVariant="list" skeletonProps={{ rows: 4 }} />
          ) : (
          <ul className="space-y-3">
            <li className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={workerHealth?.status === 'UP' ? 'default' : 'destructive'} className="capitalize h-5 py-0 px-2 font-medium">
                {workerHealth?.status || 'Unknown'}
              </Badge>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <Badge variant={workerHealth?.database === 'UP' ? 'default' : 'destructive'} className="capitalize h-5 py-0 px-2 font-medium">
                {workerHealth?.database || 'Unknown'}
              </Badge>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-medium">
                {workerHealth ? `${(workerHealth.uptime / 3600).toFixed(1)}h` : 'Unknown'}
              </span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Timezone</span>
              <span className="font-medium">{workerHealth?.timezone || 'Unknown'}</span>
            </li>
          </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}