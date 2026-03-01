"use client";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { TerminalSquare } from "lucide-react";

export default function LogsStubPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Logs"
        description="Aktivitas sistem dan log error dari berbagai layanan."
      />

      <div className="pt-12">
        <EmptyState
          icon={<TerminalSquare className="h-12 w-12 text-muted-foreground/50" />}
          title="Under Construction"
          description="Halaman Logs belum tersedia untuk saat ini."
        />
      </div>
    </div>
  );
}
