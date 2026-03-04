'use client';

import { useState } from 'react';
import { MessageSquare, Trash2, Info, AlertTriangle, Edit3 } from 'lucide-react';
import { useConfirm, useAlert, usePrompt } from '@/lib/dialog';
import { PageHeader } from '@/components/common/page-header';

export default function DialogsDemoPage() {
  const confirm = useConfirm();
  const alert = useAlert();
  const prompt = usePrompt();
  const [lastResult, setLastResult] = useState<string | null>(null);

  const demos = [
    {
      label: 'Confirm (default)',
      icon: MessageSquare,
      color: 'bg-primary/10 text-primary',
      description: 'Standard yes/no confirmation',
      code: `const ok = await confirm({ title: 'Are you sure?' })`,
      action: async () => {
        const ok = await confirm({
          title: 'Save changes?',
          description: 'Your unsaved changes will be committed.',
          confirmLabel: 'Save',
        });
        setLastResult(ok ? '✅ Confirmed' : '❌ Cancelled');
      },
    },
    {
      label: 'Confirm (destructive)',
      icon: Trash2,
      color: 'bg-destructive/10 text-destructive',
      description: 'Red confirm button for dangerous actions',
      code: `const ok = await confirm({ variant: 'destructive' })`,
      action: async () => {
        const ok = await confirm({
          title: 'Delete this item?',
          description: 'This action cannot be undone. The item will be permanently removed.',
          confirmLabel: 'Delete',
          variant: 'destructive',
        });
        setLastResult(ok ? '✅ Deleted (demo)' : '❌ Cancelled');
      },
    },
    {
      label: 'Alert – Info',
      icon: Info,
      color: 'bg-blue-500/10 text-blue-600',
      description: 'Single-button informational dialog',
      code: `await alert({ title: 'FYI', variant: 'info' })`,
      action: async () => {
        await alert({
          title: 'Feature coming soon',
          description: 'This feature is currently in development.',
          variant: 'info',
        });
        setLastResult('ℹ️ Alert dismissed');
      },
    },
    {
      label: 'Alert – Warning',
      icon: AlertTriangle,
      color: 'bg-amber-500/10 text-amber-600',
      description: 'Warning-styled alert',
      code: `await alert({ title: '...', variant: 'warning' })`,
      action: async () => {
        await alert({
          title: 'Session expiring soon',
          description: 'Your session will expire in 5 minutes.',
          variant: 'warning',
          confirmLabel: 'Got it',
        });
        setLastResult('⚠️ Warning acknowledged');
      },
    },
    {
      label: 'Prompt',
      icon: Edit3,
      color: 'bg-emerald-500/10 text-emerald-600',
      description: 'Ask user for text input',
      code: `const value = await prompt({ title: 'Rename...' })`,
      action: async () => {
        const value = await prompt({
          title: 'Rename team',
          description: 'Enter a new name for this team.',
          label: 'Team name',
          placeholder: 'e.g. Product Design',
          defaultValue: 'Current Team Name',
        });
        setLastResult(value !== null ? `✏️ New name: "${value}"` : '❌ Cancelled');
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dialog System"
        description="Programmatic, promise-based dialog hooks for confirms, alerts, and prompts without needing local state."
        icon={MessageSquare}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demos.map(({ label, icon: Icon, color, description, code, action }) => (
          <button
            key={label}
            onClick={action}
            className="group text-left rounded-xl border border-border/50 bg-card p-5 hover:border-border hover:shadow-sm transition-all space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-4.5 w-4.5" size={18} />
              </div>
              <span className="font-semibold text-sm">{label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
            <code className="block text-[10px] font-mono bg-muted/60 rounded-md px-2 py-1.5 text-muted-foreground truncate">
              {code}
            </code>
          </button>
        ))}
      </div>

      {lastResult && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 rounded-xl border border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">
            Result: <span className="text-foreground">{lastResult}</span>
          </span>
          <button
            onClick={() => setLastResult(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            clear
          </button>
        </div>
      )}
    </div>
  );
}
