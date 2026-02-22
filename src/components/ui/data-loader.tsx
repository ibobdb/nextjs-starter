import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────
// DataLoader – reusable skeleton for fetch states
// Usage:
//   <DataLoader variant="card" />
//   <DataLoader variant="table" rows={5} />
//   <DataLoader variant="stat-cards" count={4} />
//   <DataLoader variant="tags" count={20} />
//   <DataLoader variant="list" rows={4} />
// ─────────────────────────────────────────────

interface DataLoaderProps {
  /** Preset shape of the skeleton. */
  variant?: "card" | "table" | "stat-cards" | "tags" | "list"
  /** Number of rows (table / list). */
  rows?: number
  /** Number of items (stat-cards / tags). */
  count?: number
  className?: string
}

export function DataLoader({
  variant = "card",
  rows = 5,
  count = 4,
  className,
}: DataLoaderProps) {
  switch (variant) {
    // ── Simple single-card block ──────────────────
    case "card":
      return (
        <div className={cn("space-y-3 p-4", className)}>
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-8 w-3/5" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      )

    // ── Grid of stat mini-cards ───────────────────
    case "stat-cards":
      return (
        <div
          className={cn(
            "grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4",
            className
          )}
        >
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-3 shadow-xs">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      )

    // ── Data table ────────────────────────────────
    case "table":
      return (
        <div className={cn("space-y-2", className)}>
          {/* header */}
          <div className="flex gap-4 px-2 pb-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-20 ml-auto" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          {/* rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-md border px-4 py-3">
              <Skeleton className="h-4 w-4 rounded-full shrink-0" />
              <Skeleton className="h-3.5 flex-1" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3.5 w-14" />
            </div>
          ))}
        </div>
      )

    // ── Keyword tag cloud ─────────────────────────
    case "tags":
      return (
        <div className={cn("flex flex-wrap gap-2 p-4", className)}>
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-6 rounded-full"
              style={{ width: `${(i * 37 % 70) + 36}px` }}
            />
          ))}
        </div>
      )

    // ── Simple label-value list ───────────────────
    case "list":
      return (
        <div className={cn("space-y-3", className)}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      )
  }
}
