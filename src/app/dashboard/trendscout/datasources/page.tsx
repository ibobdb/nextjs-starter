"use client"

import { Database, Activity } from "lucide-react"
import DatasourceMonitor from "./_component/datasource-monitor"
import JobLogHistory from "./_component/job-log-history"
import PipelineTrigger from "./_component/pipeline-trigger"
import MaintenanceTools from "./_component/maintenance-tools"

export default function DatasourcesPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Page Header & System Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-8">
        <div className="flex flex-col gap-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Data Sources</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto lg:mx-0">
            Monitor the health and performance of automated data ingestion sources including GitHub, Reddit, and more.
          </p>
        </div>
      <PipelineTrigger />
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Datasource Monitoring Section */}
        <section className="space-y-4">
          <DatasourceMonitor />
        </section>

        {/* General Task History */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">General Task History</h2>
          </div>
          <JobLogHistory />
        </section>

        {/* Maintenance Tools */}
        <section className="pt-8 border-t border-dashed">
          <MaintenanceTools />
        </section>
      </div>
    </div>
  )
}
