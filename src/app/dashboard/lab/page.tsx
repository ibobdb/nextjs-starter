'use client';

import { FlaskConical } from 'lucide-react';
import { CallbackTester } from '@/components/dashboard/callback-tester';
import { PageHeader } from '@/components/common/page-header';

export default function AsyncTestingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Diagnostic Lab"
        description="Internal tools for system orchestration and asynchronous task verification."
        icon={FlaskConical}
      />

      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3 text-blue-700 text-xs">
        <FlaskConical className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider">Experimental Environment</p>
          <p className="leading-relaxed">
            Use this lab to simulate background task lifecycles and verify callback integrations.
            This replaces the previous worker-specific tests with a generic framework for the Base Project.
          </p>
        </div>
      </div>

      <CallbackTester />
    </div>
  );
}
