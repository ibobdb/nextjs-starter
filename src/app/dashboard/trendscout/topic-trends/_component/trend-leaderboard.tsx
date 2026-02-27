"use client"

import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataLoader } from "@/components/ui/data-loader"
import { topicsApi } from "@/services/ts-worker/api/topics"
import { TrendKeyword } from "@/services/ts-worker/types"
import { TrendingUp, Flame, Hash } from "lucide-react"

const fetchTrends = () =>
  topicsApi.getTrends(10).then((res) => {
    if (res.success && res.data) return res.data as TrendKeyword[];
    throw new Error("Failed to fetch trends");
  });

const rankIcon = (i: number) => {
  if (i === 0) return <Flame className="h-3.5 w-3.5 text-orange-500" />;
  if (i < 3) return <TrendingUp className="h-3.5 w-3.5 text-primary" />;
  return <Hash className="h-3.5 w-3.5 text-muted-foreground" />;
};

export default function TrendLeaderboard() {
  const { data: trends, isLoading } = useSWR("ts-worker/topics/trends", fetchTrends, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          Trending Keywords
        </CardTitle>
        <CardDescription>Top 20 trending keywords across all datasources</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <DataLoader variant="list" rows={8} />
        ) : !trends?.length ? (
          <p className="text-sm text-muted-foreground italic text-center py-6">No trending data available.</p>
        ) : (
          <ol className="space-y-2">
            {trends.map((kw, i) => (
              <li
                key={kw.keyword}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs text-muted-foreground font-mono w-4 shrink-0">{i + 1}</span>
                  {rankIcon(i)}
                  <span className="text-sm font-medium truncate">{kw.keyword}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-xs tabular-nums">
                    {kw.volume.toLocaleString()}
                  </Badge>
                  {kw.source?.length > 0 && (
                    <span className="text-[10px] text-muted-foreground hidden sm:block">
                      {kw.source.slice(0, 2).join(", ")}
                      {kw.source.length > 2 && ` +${kw.source.length - 2}`}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
