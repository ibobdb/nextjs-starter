"use client"

import { Settings } from "lucide-react"
import ConfigManager from "./_component/config-manager"

export default function TrendScoutSettingsPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-8">
        <div className="flex flex-col gap-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-orange-500" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Worker Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto lg:mx-0">
            Manage global TrendScout worker configurations, AI model parameters, and processing variables.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <ConfigManager />
      </div>
    </div>
  )
}
