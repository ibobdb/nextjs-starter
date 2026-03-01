"use client"

import { useState, useEffect, useRef } from "react"
import { jobsApi } from "@/services/ts-worker/api/jobs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Loader2, PlayCircle, Info, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type PollStatus = 'idle' | 'running' | 'SUCCESS' | 'FAILED'

export default function PipelineTrigger() {
  const [isRunning, setIsRunning] = useState(false)
  const [pollStatus, setPollStatus] = useState<PollStatus>('idle')
  const [jobId, setJobId] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Start polling when jobId is set
  useEffect(() => {
    if (!jobId) return

    // Use setTimeout(0) to defer setState call out of the synchronous effect body
    const statusTimer = setTimeout(() => setPollStatus('running'), 0)
    intervalRef.current = setInterval(async () => {

      try {
        const res = await jobsApi.getJobStatus(jobId)
        if (!res.success || !res.data) return

        // The status from the API uses uppercase SUCCESS/FAILED
        const status = (res.data as unknown as { status: string }).status
        if (status === 'SUCCESS' || status === 'FAILED') {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
          setPollStatus(status as 'SUCCESS' | 'FAILED')
          setJobId(null)
          setIsRunning(false)

          if (status === 'SUCCESS') {
            toast.success("Pipeline completed successfully!")
          } else {
            toast.error("Pipeline failed. Check job logs for details.")
          }
        }
      } catch {
        // silently ignore transient polling errors
      }
    }, 3000)

    return () => {
      clearTimeout(statusTimer)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [jobId])

  const handleRunFull = async () => {
    setIsRunning(true)
    setPollStatus('idle')
    setJobId(null)

    try {
      const res = await jobsApi.runFullPipeline()
      if (res.success) {
        const data = res.data as unknown as { jobId?: string }
        const id = data?.jobId
        if (id) {
          setJobId(id)
          toast.info(`Pipeline started — monitoring job #${id}…`)
        } else {
          // API didn't return a jobId — still show success
          toast.success("Pipeline initiated successfully!")
          setIsRunning(false)
          setPollStatus('SUCCESS')
        }
      } else {
        toast.error(`Failed to start pipeline: ${res.message}`)
        setIsRunning(false)
      }
    } catch (error) {
      toast.error("An error occurred while starting the pipeline.")
      console.error(error)
      setIsRunning(false)
    }
  }

  const statusBadge = () => {
    if (pollStatus === 'running') {
      return (
        <Badge variant="secondary" className="gap-1 text-[10px] animate-pulse">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          Running…
        </Badge>
      )
    }
    if (pollStatus === 'SUCCESS') {
      return (
        <Badge className="gap-1 text-[10px] bg-green-500/10 text-green-600 border-green-500/30">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Completed
        </Badge>
      )
    }
    if (pollStatus === 'FAILED') {
      return (
        <Badge variant="destructive" className="gap-1 text-[10px] bg-red-500/10 text-red-600 border-red-500/30">
          <XCircle className="h-2.5 w-2.5" />
          Failed
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between p-3 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
            isRunning ? "bg-primary/20 animate-pulse" : "bg-primary/10"
          )}>
            <Zap className={cn("h-5 w-5", isRunning ? "text-primary fill-primary/20" : "text-primary")} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold leading-none">System Pipeline</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
              Ingest → NLP → Stats → Topic
            </div>
            {statusBadge()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  <Info className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] max-w-[200px]">
                Triggering the pipeline will process all historical data and regenerate topics. This may take several minutes.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button 
            size="sm"
            className="gap-2 h-9 px-4 font-semibold shadow-sm cursor-pointer"
            onClick={handleRunFull} 
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
            {isRunning ? "Running..." : "Run Pipeline"}
          </Button>
        </div>
      </div>
    </div>
  );
}
