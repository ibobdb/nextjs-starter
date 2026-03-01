"use client";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Users2 } from "lucide-react";

export default function TeamsStubPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams & Workspaces"
        description="Kelola tim dan struktur organisasi dalam platform."
      />

      <div className="pt-12">
        <EmptyState
          icon={<Users2 className="h-12 w-12 text-muted-foreground/50" />}
          title="Work in Progress"
          description="Fitur manajemen tim belum siap digunakan."
        />
      </div>
    </div>
  );
}
