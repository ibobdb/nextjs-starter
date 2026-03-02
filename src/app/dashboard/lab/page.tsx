'use client';

import { TestTube, FlaskConical, ArrowLeft } from 'lucide-react';
import { CallbackTester } from '@/components/dashboard/callback-tester';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AsyncTestingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-8">
        <div className="flex flex-col gap-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4">
             <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 shrink-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <TestTube className="h-5 w-5 text-purple-600" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Diagnostic Lab</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto lg:mx-0 ml-13">
            Internal tools for system orchestration and asynchronous task verification.
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-8">
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3 text-blue-700">
          <FlaskConical className="h-5 w-5 shrink-0" />
          <div className="text-xs space-y-2">
            <p className="font-bold uppercase tracking-wider">Experimental Environment</p>
            <p className="leading-relaxed">
              Use this lab to simulate background task lifecycles and verify callback integrations. 
              This replaces the previous worker-specific tests with a generic framework for the Base Project.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <CallbackTester />
        </div>
      </div>
    </div>
  );
}
