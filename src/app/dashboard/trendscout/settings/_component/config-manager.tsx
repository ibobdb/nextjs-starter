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
  AlertCircle,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Cpu,
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
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { configApi } from "@/services/ts-worker/api/config"
import { toast } from "sonner"
import { DataLoader } from "@/components/ui/data-loader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type ConnectionStatus = 'idle' | 'testing' | 'ok' | 'fail'

export default function ConfigManager() {
  const { data: response, isLoading, mutate, isValidating } = useSWR(
    "ts-worker/api/config",
    () => configApi.getConfig()
  )

  const { data: modelsResponse } = useSWR(
    "ts-worker/api/config/models",
    () => configApi.getModels(),
    { revalidateOnFocus: false }
  )

  const [configs, setConfigs] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  // Test Connection state
  const [testProvider, setTestProvider] = useState("")
  const [testModel, setTestModel] = useState("")
  const [testApiKey, setTestApiKey] = useState("")
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('idle')
  const [connTested, setConnTested] = useState(false)
  const [connError, setConnError] = useState<string | null>(null)

  const modelsData = modelsResponse?.data
  const availableProviders: string[] = modelsData?.availableProviders ?? []
  const recommendedModels: Record<string, string[]> = modelsData?.recommendedModels ?? {}
  const selectedProviderModels: string[] = testProvider ? (recommendedModels[testProvider] ?? []) : []

  useEffect(() => {
    if (response?.success && response.data) {
      setConfigs(response.data)
    }
  }, [response])

  // Pre-fill from active config when models load
  useEffect(() => {
    const current = modelsData?.current?.filter
    if (current?.provider && !testProvider) setTestProvider(current.provider)
    if (current?.model && !testModel) setTestModel(current.model)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelsData])

  // Reset tested state when provider/model/apiKey changes
  useEffect(() => {
    setConnTested(false)
    setConnStatus('idle')
  }, [testProvider, testModel, testApiKey])

  const handleUpdateValue = (key: string, value: string) => {
    setConfigs(prev => ({ ...prev, [key]: value }))
  }

  const handleDeleteKey = (key: string) => {
    const updated = { ...configs }
    delete updated[key]
    setConfigs(updated)
  }

  const handleAddConfig = () => {
    if (!newKey) { toast.error("Key cannot be empty"); return }
    if (configs[newKey]) { toast.error("Key already exists"); return }
    setConfigs(prev => ({ ...prev, [newKey]: newValue }))
    setNewKey(""); setNewValue("")
    toast.success("Config added to list (unsaved)")
  }

  const handleTestConnection = async () => {
    if (!testProvider || !testModel) {
      toast.error("Select a provider and model first")
      return
    }
    setConnStatus('testing')
    setConnError(null)
    try {
      const res = await configApi.testConnection({
        provider: testProvider,
        model: testModel,
        apiKey: testApiKey || undefined,
      })
      if (res.success && res.data?.success) {
        setConnStatus('ok')
        setConnTested(true)
        toast.success(res.data.message || `Connected to ${testProvider} / ${testModel}!`)
      } else {
        setConnStatus('fail')
        setConnTested(false)
        
        let errMsg = res.message || "Connection test failed";
        if (res.error) {
          if (typeof res.error === 'string') errMsg = res.error;
          else if (typeof res.error === 'object' && res.error !== null && 'message' in res.error) {
            errMsg = (res.error as { message: string }).message;
          }
        }
        setConnError(errMsg);
        toast.error("Connection test failed");
      }
    } catch (error: unknown) {
      setConnStatus('fail')
      setConnTested(false)
      
      let errMsg = "Connection test failed";
      if (error && typeof error === 'object' && 'message' in error) {
        errMsg = (error as { message?: string; error?: string | { message: string } }).message
          || "Connection test failed";
        const innerErr = (error as { error?: string | { message: string } }).error;
        if (innerErr && typeof innerErr === 'object' && 'message' in innerErr) {
          errMsg = (innerErr as { message: string }).message;
        }
      }
      
      setConnError(errMsg);
      toast.error("Connection test failed");
    }
  }

  const handleSaveApiKey = async () => {
    if (!connTested) { toast.error("Run Test Connection first"); return }
    setIsSaving(true)
    try {
      const keyMap: Record<string, string> = {}
      if (testApiKey) {
        const keyName = testProvider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY'
        keyMap[keyName] = testApiKey
      }
      keyMap[`AI_FILTER_PROVIDER`] = testProvider
      keyMap[`AI_FILTER_MODEL`] = testModel

      const res = await configApi.updateConfig(keyMap)
      if (res.success) {
        await configApi.clearCache()
        toast.success("API key saved and cache cleared!")
        setTestApiKey("")
        setConnStatus('idle')
        setConnTested(false)
        mutate()
      } else {
        toast.error(res.message || "Failed to save API key")
      }
    } catch {
      toast.error("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await configApi.updateConfig(configs)
      if (res.success) {
        // Always clear cache after saving so changes take effect immediately
        await configApi.clearCache()
        toast.success("Configurations saved and cache cleared")
        mutate()
      } else {
        toast.error(res.message || "Failed to update configurations")
      }
    } catch {
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
    } catch {
      toast.error("An error occurred while clearing cache")
    } finally {
      setIsClearing(false)
    }
  }

  if (isLoading && !response) {
    return <DataLoader variant="table" rows={5} />
  }

  return (
    <div className="space-y-8">

      {/* ── AI Connection Test ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">AI Connection Test</h2>
        </div>

        <Card className="border-blue-500/20">
          <CardHeader className="bg-blue-500/5 pb-4">
            <CardTitle className="text-sm font-semibold">Test Before You Save</CardTitle>
            <CardDescription className="text-xs">
              Always verify your API key connects successfully before saving. A bad key silently fails all AI evaluations.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Provider</Label>
                <Select value={testProvider} onValueChange={setTestProvider}>
                  <SelectTrigger className="h-9 text-xs">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Select provider" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders.length > 0 ? availableProviders.map(p => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    )) : (
                      <>
                        <SelectItem value="gemini">Gemini</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Model</Label>
                <Select value={testModel} onValueChange={setTestModel} disabled={!testProvider}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProviderModels.map(m => (
                      <SelectItem key={m} value={m} className="font-mono text-xs">{m}</SelectItem>
                    ))}
                    {selectedProviderModels.length === 0 && testProvider && (
                      <SelectItem value="" disabled>Loading models…</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">API Key (optional)</Label>
                <Input
                  type="password"
                  placeholder="sk-… or AI…"
                  value={testApiKey}
                  onChange={e => setTestApiKey(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 h-9"
                onClick={handleTestConnection}
                disabled={connStatus === 'testing' || !testProvider || !testModel}
              >
                {connStatus === 'testing'
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <FlaskConical className="h-3.5 w-3.5" />}
                Test Connection
              </Button>

              {connStatus === 'ok' && (
                <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </Badge>
              )}
              {connStatus === 'fail' && (
                <Badge variant="destructive" className="gap-1 bg-red-500/10 text-red-600 border-red-500/30">
                  <XCircle className="h-3 w-3" /> Failed
                </Badge>
              )}

              {connTested && (
                <Button
                  size="sm"
                  className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 ml-auto"
                  onClick={handleSaveApiKey}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save & Apply
                </Button>
              )}
            </div>

            {connStatus === 'fail' && connError && (
              <Alert variant="destructive" className="bg-red-500/5 border-red-500/20 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-[11px] leading-tight font-mono whitespace-pre-wrap">
                  {connError}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ── Raw Config Variables ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Worker Configuration</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" size="sm" 
              onClick={handleClearCache} disabled={isClearing}
              className="text-xs h-8 gap-1.5"
            >
              {isClearing ? <Loader2 className="h-3 w-3 animate-spin text-orange-500" /> : <RefreshCw className="h-3 w-3 text-orange-500" />}
              Clear Cache
            </Button>
            <Button 
              variant="outline" size="sm" 
              onClick={() => mutate()} disabled={isValidating}
              className="text-xs h-8 gap-1.5"
            >
              <RotateCcw className={`h-3 w-3 ${isValidating ? "animate-spin" : ""}`} />
              Reset
            </Button>
            <Button 
              size="sm" onClick={handleSave} disabled={isSaving}
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
                      {(key.includes('PROMPT') || key.includes('VOICE') || key.includes('TONE')) ? (
                        <Textarea 
                          value={value} 
                          onChange={(e) => handleUpdateValue(key, e.target.value)}
                          className="min-h-[100px] text-xs font-mono bg-background focus-visible:ring-orange-500/30 py-2"
                        />
                      ) : (key.includes('THRESHOLD') || key.includes('WEIGHT')) ? (
                        <Input 
                          type="number"
                          step="0.01"
                          value={value} 
                          onChange={(e) => handleUpdateValue(key, e.target.value)}
                          className="h-8 text-xs font-mono bg-background focus-visible:ring-orange-500/30 w-36"
                        />
                      ) : (
                        <Input 
                          value={value} 
                          onChange={(e) => handleUpdateValue(key, e.target.value)}
                          className="h-8 text-xs font-mono bg-background focus-visible:ring-orange-500/30"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant="ghost" size="icon" 
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
                      variant="outline" size="icon" 
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
    </div>
  )
}
