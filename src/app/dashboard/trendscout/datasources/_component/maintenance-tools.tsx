"use client"

import { useState } from "react"
import { jobsApi } from "@/services/ts-worker/api/jobs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Trash2, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MaintenanceTools() {
  const [retentionDays, setRetentionDays] = useState(30)
  const [loading, setLoading] = useState(false)

  const handleCleanup = async () => {
    setLoading(true)
    try {
      const res = await jobsApi.cleanup(retentionDays)
      if (res.success) {
        toast.success(`Cleanup complete: ${res.data?.deletedCounts.rawItems ?? 0} items, ${res.data?.deletedCounts.jobLogs ?? 0} logs removed.`)
      } else {
        toast.error(`Cleanup failed: ${res.message}`)
      }
    } catch {
      toast.error("An error occurred during cleanup.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive font-bold">System Maintenance</CardTitle>
        </div>
        <CardDescription>
          Perform destructive actions to keep the database clean and optimized.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-end gap-4 max-w-md">
          <div className="flex-1 space-y-2">
            <Label htmlFor="retention" className="text-xs font-semibold">Retention (Days)</Label>
            <div className="relative">
               <Input 
                id="retention" 
                type="number" 
                value={retentionDays} 
                onChange={e => setRetentionDays(parseInt(e.target.value) || 0)}
                className="h-9 transition-all focus:ring-destructive/30"
              />
              <span className="absolute right-3 top-2 text-[10px] text-muted-foreground font-medium uppercase">Days</span>
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="h-9 gap-2 shadow-lg shadow-destructive/20 active:scale-95 transition-all"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Run Cleanup
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will PERMANENTLY delete all raw data items and background job logs older than <strong>{retentionDays} days</strong>. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCleanup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, Clean Up Old Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <p className="mt-4 text-[10px] text-muted-foreground flex items-center gap-1.5 italic">
          <RefreshCw className="h-3 w-3" /> Recommended: Run every 30 days to maintain performance.
        </p>
      </CardContent>
    </Card>
  )
}
