"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { 
  Settings2, 
  Save, 
  RotateCcw, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Loader2,
  AlertCircle
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { configApi } from "@/services/ts-worker/api/config"
import { toast } from "sonner"
import { SystemConfig } from "@/services/ts-worker/types"
import { DataLoader } from "@/components/ui/data-loader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ConfigManager() {
  const { data: response, isLoading, mutate, isValidating } = useSWR(
    "ts-worker/api/config",
    () => configApi.getConfig()
  )
  
  const [configs, setConfigs] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  useEffect(() => {
    if (response?.success && response.data) {
      setConfigs(response.data)
    }
  }, [response])

  const handleUpdateValue = (key: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleDeleteKey = (key: string) => {
    const updated = { ...configs }
    delete updated[key]
    setConfigs(updated)
  }

  const handleAddConfig = () => {
    if (!newKey) {
      toast.error("Key cannot be empty")
      return
    }
    if (configs[newKey]) {
      toast.error("Key already exists")
      return
    }
    setConfigs(prev => ({
      ...prev,
      [newKey]: newValue
    }))
    setNewKey("")
    setNewValue("")
    toast.success("Config added to list (unsaved)")
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await configApi.updateConfig(configs)
      if (res.success) {
        toast.success("Configurations updated successfully")
        mutate()
      } else {
        toast.error(res.message || "Failed to update configurations")
      }
    } catch (error) {
      toast.error("An error occurred while saving configurations")
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearCache = async () => {
    setIsClearing(true)
    try {
      const res = await configApi.clearCache()
      if (res.success) {
        toast.success("Configuration cache cleared")
      } else {
        toast.error(res.message || "Failed to clear cache")
      }
    } catch (error) {
      toast.error("An error occurred while clearing cache")
    } finally {
      setIsClearing(false)
    }
  }

  if (isLoading && !response) {
    return <DataLoader variant="table" rows={5} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Worker Configuration</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearCache} 
            disabled={isClearing}
            className="text-xs h-8 gap-1.5"
          >
            {isClearing ? <Loader2 className="h-3 w-3 animate-spin text-orange-500" /> : <RefreshCw className="h-3 w-3 text-orange-500" />}
            Clear Cache
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => mutate()} 
            disabled={isValidating}
            className="text-xs h-8 gap-1.5"
          >
            <RotateCcw className={`h-3 w-3 ${isValidating ? "animate-spin" : ""}`} />
            Reset
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving}
            className="text-xs h-8 gap-1.5 bg-orange-600 hover:bg-orange-700"
          >
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-orange-500/20">
        <CardHeader className="bg-orange-500/5 pb-4">
          <CardTitle className="text-sm font-semibold">Variable Definitions</CardTitle>
          <CardDescription className="text-xs">
            Directly update worker behavior by modifying these environment-level variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[300px] text-[10px] font-bold uppercase tracking-wider pl-6">Config Key</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Value</TableHead>
                <TableHead className="w-[100px] text-right pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(configs).map(([key, value]) => (
                <TableRow key={key} className="hover:bg-muted/10 transition-colors border-orange-500/5">
                  <TableCell className="pl-6">
                    <code className="text-[11px] font-mono font-semibold text-orange-600 bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/20">
                      {key}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={value} 
                      onChange={(e) => handleUpdateValue(key, e.target.value)}
                      className="h-8 text-xs font-mono bg-background focus-visible:ring-orange-500/30"
                    />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteKey(key)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Add New Config Row */}
              <TableRow className="bg-muted/5">
                <TableCell className="pl-6">
                  <Input 
                    placeholder="NEW_CONFIG_KEY"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                    className="h-8 text-[11px] font-mono bg-background border-dashed focus-visible:ring-primary/30"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    placeholder="value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="h-8 text-xs font-mono bg-background border-dashed focus-visible:ring-primary/30"
                  />
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button 
                    variant="outline"
                    size="icon" 
                    className="h-7 w-7 border-dashed border-primary/40 hover:bg-primary/5 hover:border-primary"
                    onClick={handleAddConfig}
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert variant="destructive" className="bg-red-500/5 border-red-500/20 text-red-600">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-xs font-bold uppercase tracking-tight">Warning: Production Impact</AlertTitle>
        <AlertDescription className="text-xs mt-1">
          Changes to these configurations may immediately affect worker processing logic, AI costs, and data extraction frequency. Double-check keys and values before saving.
        </AlertDescription>
      </Alert>
    </div>
  )
}
