'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNotificationSystem } from '@/lib/notification-package';

export function CallbackTester() {
  const { refresh } = useNotificationSystem();
  const [loading, setLoading] = useState<'success' | 'failure' | null>(null);

  const runTest = async (type: 'success' | 'failure') => {
    setLoading(type);
    try {
      const res = await fetch('/api/tasks/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type === 'success' ? 'test-success' : 'test-failure',
          title: `Diagnostic: Callback ${type === 'success' ? 'Success' : 'Failure'} Test`,
          delayMs: type === 'success' ? 5000 : 3000 // 5s for success, 3s for failure
        })
      }).then(r => r.json());

      if (res.success) {
        toast.success(`Test initiated! Wait ${type === 'success' ? '5s' : '3s'} for background completion.`);
        refresh(); // Proactively refresh tasks to show icon instantly
      } else {
        toast.error(`Test failed to start: ${res.message}`);
      }
    } catch (err: any) {
      toast.error('Failed to trigger test.');
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/20">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-primary" /> Callback Integration Diagnostics
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Verify that your dashboard correctly receives and processes asynchronous worker updates.
        </p>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-2 text-green-600 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Success Flow
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Simulates a successful worker job. Should trigger a "COMPLETED" task status and a "SUCCESS" notification after 5 seconds.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 border-green-500/30 hover:bg-green-500/10 text-green-700"
            onClick={() => runTest('success')}
            disabled={!!loading}
          >
            {loading === 'success' ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <PlayCircle className="h-3 w-3 mr-2" />}
            Run Success Test
          </Button>
        </div>

        <div className="flex flex-col gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <AlertCircle className="h-4 w-4" /> Failure Flow
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Simulates a failed worker job. Should trigger a "FAILED" task status and an "ERROR" notification after 3 seconds.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 border-red-500/30 hover:bg-red-500/10 text-red-700"
            onClick={() => runTest('failure')}
            disabled={!!loading}
          >
            {loading === 'failure' ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <PlayCircle className="h-3 w-3 mr-2" />}
            Run Failure Test
          </Button>
        </div>
      </div>
    </div>
  );
}
