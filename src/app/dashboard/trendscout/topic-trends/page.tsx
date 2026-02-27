'use client'
import dynamic from "next/dynamic"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { topicsApi } from "@/services/ts-worker/api/topics"
import { BrainCircuit, Loader2 } from "lucide-react"
import { toast } from "sonner"

const TrendLeaderboard  = dynamic(() => import("./_component/trend-leaderboard"),  { ssr: false })
const CandidateWorkbench = dynamic(() => import("./_component/candidate-workbench"), { ssr: false })

export default function TopicTrendsPage() {
  const [evaluating, setEvaluating] = useState(false)

  const handleEvaluateAll = async () => {
    setEvaluating(true)
    try {
      const res = await topicsApi.evaluateAll()
      if (res.success) {
        toast.success("AI evaluation triggered for all pending candidates.")
      } else {
        toast.error(`Evaluate failed: ${res.message}`)
      }
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Topic &amp; Trends</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review trending keywords, manage topic candidates, and run AI clustering.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start sm:self-auto"
          onClick={handleEvaluateAll}
          disabled={evaluating}
        >
          {evaluating
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <BrainCircuit className="h-3.5 w-3.5" />}
          {evaluating ? "Evaluating..." : "Evaluate All"}
        </Button>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left sidebar: Trending Keywords */}
        <div className="lg:col-span-1">
          <TrendLeaderboard />
        </div>

        {/* Right main: Candidate Workbench */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <CandidateWorkbench />
        </div>
      </div>
    </div>
  )
}