'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Play, XCircle, Copy, Send, Loader2, Clock, Timer, FlaskConical } from 'lucide-react';
import axios from 'axios';
import { useNotificationSystem } from '@/lib/notification-package';

// Custom Simple Progress Bar since radix-ui/progress might be missing

// Custom Simple Progress Bar since radix-ui/progress might be missing
function CustomProgress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
      <div 
        className="h-full bg-purple-600 transition-all duration-100 ease-linear" 
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function CallbackTester() {
  const { refresh } = useNotificationSystem();
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(5); // Default 5 seconds
  const [triggerResult, setTriggerResult] = useState<{ taskId: string; callbackUrl: string; status: 'test-success' | 'test-failure' } | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const simulateWebhook = useCallback(async (status: 'COMPLETED' | 'FAILED') => {
    if (!triggerResult) return;
    setSimulating(true);
    try {
      await axios.post(triggerResult.callbackUrl, {
        status,
        result: {
          message: `Simulation of ${status} after ${duration}s`,
          completedAt: new Date().toISOString()
        }
      });
      toast.success(`Task marked as ${status}`);
      setTriggerResult(null); // Clear after completion
      setProgress(0);
      setTimeLeft(0);
    } catch {
      toast.error('Webhook simulation failed');
    } finally {
      setSimulating(false);
    }
  }, [triggerResult, duration]);

  const autoComplete = useCallback(() => {
    if (triggerResult) {
       simulateWebhook(triggerResult.status === 'test-success' ? 'COMPLETED' : 'FAILED');
    }
  }, [triggerResult, simulateWebhook]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 0.1;
          if (next <= 0) {
            clearInterval(interval);
            autoComplete();
            return 0;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [timeLeft, triggerResult, duration, autoComplete]);

  useEffect(() => {
    if (timeLeft > 0 && duration > 0) {
        setProgress(((duration - timeLeft) / duration) * 100);
    } else if (timeLeft <= 0 && triggerResult) {
        setProgress(100);
    } else {
        setProgress(0);
    }
  }, [timeLeft, duration, triggerResult]);

  const triggerTask = async (action: 'test-success' | 'test-failure') => {
    setLoading(true);
    setTriggerResult(null);
    setProgress(0);
    setTimeLeft(0);
    
    try {
      const res = await axios.post('/api/tasks/trigger', {
        action,
        title: `Diagnostic: ${action === 'test-success' ? 'Success Test' : 'Failure Test'}`,
        data: { timestamp: new Date().toISOString(), duration }
      });

      if (res.data.success) {
        setTriggerResult({
          taskId: res.data.taskId,
          callbackUrl: res.data.callbackUrl,
          status: action
        });
        toast.success(`Task triggered: ${res.data.taskId}`);
        
        // Refresh the global task list immediately
        refresh();
        
        if (duration > 0) {
            setTimeLeft(duration);
        } else {
            // If duration is 0, trigger webhook immediately
            setTimeout(() => {
                simulateWebhook(action === 'test-success' ? 'COMPLETED' : 'FAILED');
            }, 500);
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to trigger task');
      } else {
        toast.error('Failed to trigger task');
      }
    } finally {
      setLoading(false);
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200/50 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-purple-600" />
            Synchronized Task Simulator
          </CardTitle>
          <CardDescription>
            Test the real-time background task flow with controllable processing duration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-muted/30 border border-dashed">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Label className="font-bold">Processing Duration</Label>
                    </div>
                    <Badge variant="outline" className="h-6 w-12 justify-center font-mono bg-background">
                        {duration}s
                    </Badge>
                </div>
                <div className="pt-2">
                    <Input 
                        type="range" 
                        min="0" 
                        max="30" 
                        step="1" 
                        value={duration} 
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer h-2 bg-purple-100 rounded-lg appearance-none"
                    />
                </div>
                <p className="text-[10px] text-muted-foreground">
                    Time before the task automatically sends a completion callback.
                </p>
            </div>

            <div className="flex items-end gap-3 justify-start md:justify-end">
                <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700 gap-2 h-11 px-6 shadow-md transition-all active:scale-95"
                    onClick={() => triggerTask('test-success')}
                    disabled={loading || timeLeft > 0}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                    Trigger Success
                </Button>
                <Button 
                    variant="destructive" 
                    className="gap-2 h-11 px-6 shadow-md transition-all active:scale-95"
                    onClick={() => triggerTask('test-failure')}
                    disabled={loading || timeLeft > 0}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Trigger Failure
                </Button>
            </div>
          </div>

          {triggerResult && duration > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-purple-600 animate-spin-slow" />
                    <span className="text-sm font-medium">Task Processing...</span>
                 </div>
                 <Badge variant="outline" className="font-mono text-purple-600 border-purple-200 bg-purple-50">
                    {timeLeft.toFixed(1)}s remaining
                 </Badge>
              </div>
              
              <CustomProgress value={progress} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg border text-[10px] space-y-1">
                      <Label className="text-[9px] uppercase text-muted-foreground tracking-widest">Active Task ID</Label>
                      <div className="flex items-center gap-2 font-mono truncate">
                        {triggerResult.taskId}
                        <Button variant="ghost" size="icon" className="h-4 w-4 ml-auto" onClick={() => copyToClipboard(triggerResult.taskId)}>
                            <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border text-[10px] space-y-1">
                      <Label className="text-[9px] uppercase text-muted-foreground tracking-widest">Callback URL</Label>
                      <div className="flex items-center gap-2 font-mono truncate max-w-[200px]">
                        {triggerResult.callbackUrl}
                        <Button variant="ghost" size="icon" className="h-4 w-4 ml-auto" onClick={() => copyToClipboard(triggerResult.callbackUrl)}>
                            <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                  </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                 <p className="text-[10px] text-muted-foreground max-w-xs italic">
                    The task is currently in <code className="text-purple-600 font-bold">RUNNING</code> state. 
                    Check the <strong>Active Tasks</strong> in the topbar/sidebar.
                 </p>
                 <Button 
                   size="sm" 
                   variant="ghost" 
                   className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                   onClick={() => simulateWebhook(triggerResult.status === 'test-success' ? 'COMPLETED' : 'FAILED')}
                   disabled={simulating}
                 >
                    {simulating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Send className="h-3 w-3 mr-1" />}
                    Skip & Complete Now
                 </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/20 border-dashed">
        <CardHeader className="py-3">
          <CardTitle className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            <FlaskConical className="h-3 w-3" />
            Verification Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent className="text-[10px] text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          <ul className="list-disc pl-4 space-y-1">
             <li><strong>Task List</strong>: Open the Task menu in the topbar to see real-time status transitions.</li>
             <li><strong>Delay Simulation</strong>: Use the slider to see how the system handles long-running tasks.</li>
          </ul>
          <ul className="list-disc pl-4 space-y-1">
             <li><strong>Real-time Stats</strong>: Running tasks apply towards the active task count.</li>
             <li><strong>Auto-Notification</strong>: After the timer completes, a notification will immediately appear in the notifications panel.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
