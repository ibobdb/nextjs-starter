"use client"

import { Cpu } from "lucide-react"
import ClusteringMonitor from "./_component/clustering-monitor"

export default function ClusteringPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Page Header & System Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-8">
        <div className="flex flex-col gap-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Clustering Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto lg:mx-0">
            Monitor AI clustering tasks, system-wide processing pipelines, and background worker activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Topic Clustering Pipeline */}
        <section className="space-y-4">
          <ClusteringMonitor />
        </section>
      </div>
    </div>
  )
}
