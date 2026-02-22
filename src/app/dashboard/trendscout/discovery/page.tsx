'use client'
import dynamic from "next/dynamic";
import { SectionCards } from "./_component/worker-stats";
import WorkerHealth from "./_component/worker-health";
import WorkerGrowth from "./_component/worker-growth";

// Lazy-load keywords (below the fold, not critical for initial render)
const WorkerKeywords = dynamic(() => import("./_component/worker-keywords"), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full rounded-xl bg-muted animate-pulse" />
  ),
});

export default function DiscoveryPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WorkerGrowth />
        <WorkerHealth />
      </div>
      <WorkerKeywords />
    </div>
  );
}