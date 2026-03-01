"use client";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Settings } from "lucide-react";

export default function SettingsStubPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Base Settings"
        description="Konfigurasi inti DBStudio dan environment vars."
      />

      <div className="pt-12">
        <EmptyState
          icon={<Settings className="h-12 w-12 text-muted-foreground/50" />}
          title="Coming Soon"
          description="Halaman pengaturan global DBStudio akan segera hadir."
        />
      </div>
    </div>
  );
}
