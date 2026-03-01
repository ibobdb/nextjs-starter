"use client";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { BarChart3 } from "lucide-react";

export default function AnalyticsStubPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Overview"
        description="Pantau performa dan statistik penggunaan DBStudio."
      />

      <div className="pt-12">
        <EmptyState
          icon={<BarChart3 className="h-12 w-12 text-muted-foreground/50" />}
          title="Coming Soon"
          description="Halaman Analytics sedang dalam tahap pengembangan. Statistik akan tersedia di update berikutnya."
        />
      </div>
    </div>
  );
}
