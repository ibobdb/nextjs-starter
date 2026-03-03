"use client";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { BarChart3 } from "lucide-react";

export default function AnalyticsStubPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Overview"
        description="Monitor the performance and usage statistics of your DB STUDIO Dashboard."
      />

      <div className="pt-12">
        <EmptyState
          icon={<BarChart3 className="h-12 w-12 text-muted-foreground/50" />}
          title="Coming Soon"
          description="The Analytics page is currently under development. Statistics will be available in the next update."
        />
      </div>
    </div>
  );
}
