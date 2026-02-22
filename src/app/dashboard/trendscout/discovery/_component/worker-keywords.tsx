"use client"

import useSWR from "swr"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { DataLoader } from "@/components/ui/data-loader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { statsApi } from "@/services/ts-worker/api/stats"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Hash } from "lucide-react"

const LIMIT = 30

const fetchKeywords = (page: number) =>
  statsApi.getKeywords({ page, limit: LIMIT }).then((res) => {
    if (res.success && res.data) {
      const keywordsData = Array.isArray(res.data)
        ? res.data
        : (res.data as any).data;
      const meta = (res.data as any).meta;
      return {
        keywords: Array.isArray(keywordsData) ? keywordsData : [],
        totalPages: meta?.totalPages || 1,
      };
    }
    throw new Error('Failed to fetch keywords');
  });

const getBadgeVariant = (score: number) => {
  if (typeof score !== 'number') return "outline" as const
  if (score > 5) return "default" as const
  if (score > 1.5) return "secondary" as const
  return "outline" as const
}

const getFontSize = (score: number) => {
  if (typeof score !== 'number') return "text-xs px-1.5 py-0"
  if (score > 5) return "text-lg px-3 py-1"
  if (score > 1.5) return "text-sm px-2 py-0.5"
  return "text-xs px-1.5 py-0"
}

export default function WorkerKeywords() {
  const [page, setPage] = useState(1)

  // SWR: each page is a separate cache entry, automatically cached on page change
  const { data, isLoading } = useSWR(
    ['ts-worker/stats/keywords', page],
    ([, p]) => fetchKeywords(p as number),
    {
      revalidateOnFocus: false,
      // dedupingInterval: 30_000,
      keepPreviousData: true,   // keep old keywords visible while loading next page
    }
  )

  const keywords = data?.keywords ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Trending Keywords
          </CardTitle>
          <CardDescription>
            Top discovered keywords across all data sources
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && keywords.length === 0 ? (
          <DataLoader variant="tags" count={24} />
        ) : keywords.length > 0 ? (
          <div className={`flex flex-wrap gap-2 items-center justify-center p-4 bg-muted/10 rounded-xl min-h-[150px] transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            {keywords.map((kw, index) => {
              const displayScore = kw.popularityScore ?? kw.score ?? (kw as any).volume ?? (kw as any).count ?? 0;
              return (
                <Badge
                  key={`${kw.keyword}-${index}`}
                  variant={getBadgeVariant(displayScore)}
                  className={`${getFontSize(displayScore)} transition-all hover:scale-110 cursor-default`}
                >
                  {kw.keyword}
                  <span className="ml-1.5 opacity-50 text-[10px]">
                    {typeof displayScore === 'number' && displayScore > 0 && displayScore < 100
                      ? displayScore.toFixed(2)
                      : displayScore}
                  </span>
                </Badge>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground italic">
            No trending keywords found.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
