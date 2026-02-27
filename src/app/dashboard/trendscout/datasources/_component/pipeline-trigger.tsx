"use client"

import { useState } from "react"
import { jobsApi } from "@/services/ts-worker/api/jobs"
import { Button } from "@/components/ui/button"
import { Zap, Loader2, PlayCircle, Info } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function PipelineTrigger() {
  const [isRunning, setIsRunning] = useState(false);

  const handleRunFull = async () => {
    setIsRunning(true);
    try {
      const res = await jobsApi.runFullPipeline();
      if (res.success) {
        toast.success("Full system pipeline initiated successfully!");
      } else {
        toast.error(`Failed to start pipeline: ${res.message}`);
      }
    } catch (error) {
      toast.error("An error occurred while starting the pipeline.");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

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
          <div className="flex flex-col">
            <h3 className="text-sm font-bold leading-none mb-1">System Pipeline</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
              Ingest → NLP → Stats → Topic
            </div>
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
