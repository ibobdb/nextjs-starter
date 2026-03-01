'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { topicsApi } from '@/services/ts-worker/api/topics'
import { TopicCandidate } from '@/services/ts-worker/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  BrainCircuit,
  FileText,
  Tag,
  TrendingUp,
  BarChart2,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Info,
  EyeOff,
  ExternalLink,
  Edit2,
  ListFilter,
  Newspaper,
  GitFork,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Fetch single candidate ‑ falls back to scanning the list if /candidates/:id not yet cached
const fetchCandidate = async (id: string): Promise<TopicCandidate> => {
  const res = await topicsApi.getCandidate(id)
  if (res.success && res.data) return res.data
  throw new Error(res.message ?? 'Candidate not found')
}

const fetchCluster = (id: string) => topicsApi.getCandidateCluster(id).then(res => res.data ?? []);
const fetchRawItems = (id: string) => topicsApi.getCandidateRawItems(id).then(res => res.data ?? []);

// Fetch sibling variants (same cluster, different id)
const fetchVariants = (clusterId: string, currentId: string) =>
  topicsApi.getCandidates({ status: 'generated', limit: 50 }).then(res => {
    const r = res as unknown as { success: boolean; data: TopicCandidate[] };
    if (!r.success) return [];
    return r.data.filter(c => c.clusterId === clusterId && c.id !== currentId);
  });

function StatCard({ icon: Icon, label, value, color = '', onEdit }: {
  icon: React.ElementType; label: string; value: string | number | null | undefined; color?: string; onEdit?: () => void
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card/60 px-4 py-3 relative group">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${color}`} /> {label}
      </span>
      <span className={`text-xl font-bold tabular-nums ${color}`}>
        {value !== null && value !== undefined ? value : <span className="text-sm text-muted-foreground italic font-normal">—</span>}
      </span>
      {onEdit && (
        <button 
          onClick={onEdit}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
        >
          <Edit2 className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}

function SectionBlock({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      {children}
    </div>
  )
}

const STATUS_MAP = {
  generated: { label: 'Pending',  variant: 'secondary'  as const },
  approved:  { label: 'Approved', variant: 'default'     as const },
  rejected:  { label: 'Rejected', variant: 'destructive' as const },
  ignored:   { label: 'Ignored',  variant: 'outline'     as const },
  drafting:  { label: 'Drafting', variant: 'secondary'  as const },
}

const VARIANT_INTENTS = [
  { value: 'tutorial',        label: 'Tutorial — Step-by-step guide' },
  { value: 'comparison',      label: 'Comparison — A vs B style' },
  { value: 'news',            label: 'News — Announcement angle' },
  { value: 'troubleshooting', label: 'Troubleshooting — How to fix' },
  { value: 'general',         label: 'General — Overview & analysis' },
]

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | 'ignore' | 'update' | 'generate' | 'brief' | 'variant' | null>(null)
  const [editData, setEditData] = useState<{ title: string; priorityScore: number } | null>(null)
  const [showVariantDialog, setShowVariantDialog] = useState(false)
  const [showAuditLogDialog, setShowAuditLogDialog] = useState(false)
  const [selectedIntent, setSelectedIntent] = useState<string>('')

  const { data: candidate, isLoading, error, mutate } = useSWR(
    id && id !== 'undefined' ? `ts-worker/topics/candidates/${id}` : null,
    () => fetchCandidate(id),
    { revalidateOnFocus: false }
  )

  const { data: clusterKeywords = [], isLoading: loadingCluster } = useSWR(
    candidate ? `ts-worker/topics/candidates/${id}/cluster` : null,
    () => fetchCluster(id)
  )

  const { data: rawItems = [], isLoading: loadingRaw } = useSWR(
    candidate ? `ts-worker/topics/candidates/${id}/raw-items` : null,
    () => fetchRawItems(id)
  )

  const { data: variants = [] } = useSWR(
    candidate?.clusterId ? `ts-worker/topics/variants/${candidate.clusterId}` : null,
    () => fetchVariants(candidate!.clusterId!, id)
  )

  const handleAction = async (action: 'approve' | 'reject' | 'ignore') => {
    if (!candidate) return
    setActionLoading(action)
    try {
      const res = action === 'approve'
        ? await topicsApi.approveCandidate(candidate.id)
        : action === 'reject'
        ? await topicsApi.rejectCandidate(candidate.id)
        : await topicsApi.ignoreCandidate(candidate.id)

        if (res.success) {
          if (action === 'approve') {
            toast.promise(mutate(), {
              loading: 'Updating candidate and generating brief...',
              success: 'Candidate approved! Brief is being generated.',
              error: 'Failed to refresh candidate data.',
            });
          } else {
            toast.success(
              action === 'reject'
                ? 'Candidate marked as rejected.'
                : 'Candidate marked as ignored.'
            );
            mutate();
            setTimeout(() => router.push('/dashboard/trendscout/topic-trends'), 1500);
          }
        } else {
        toast.error(`Failed: ${res.message}`)
      }
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdate = async () => {
    if (!candidate || !editData) return
    setActionLoading('update')
    try {
      const res = await topicsApi.updateCandidate(candidate.id, editData)
      if (res.success) {
        toast.success('Metadata updated.')
        mutate()
        setEditData(null)
      } else {
        toast.error(`Update failed: ${res.message}`)
      }
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleGenerateContent = async () => {
    if (!candidate) return
    setActionLoading('generate')
    try {
      const res = await topicsApi.generateContent(candidate.id)
      if (res.success && res.data) {
        toast.success('Draft generated successfully!')
        router.push(`/dashboard/trendscout/content/${res.data.id}`)
      } else {
        toast.error(`Generation failed: ${res.message}`)
      }
    } catch {
      toast.error('Something went wrong during generation.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleGenerateBrief = async () => {
    if (!candidate) return
    setActionLoading('brief')
    try {
      const res = await topicsApi.generateBrief(candidate.id)
      if (res.success) {
        toast.success('AI Brief generated successfully!')
        mutate()
      } else {
        toast.error(`Brief generation failed: ${res.message}`)
      }
    } catch {
      toast.error('Something went wrong during brief generation.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateVariant = async () => {
    if (!candidate || !selectedIntent) return
    setActionLoading('variant')
    try {
      const res = await topicsApi.createVariant(candidate.id, selectedIntent)
      if (res.success && res.data) {
        toast.success(`Variant created with intent: ${selectedIntent}`)
        setShowVariantDialog(false)
        setSelectedIntent('')
        
        const newId = res.data?.id
          || (res.data as { candidate?: { id: string } })?.candidate?.id
          || (res.data as { _id?: string })?._id
        
        if (newId) {
          router.push(`/dashboard/trendscout/topic-trends/${newId}`)
        } else {
          toast.info('Variant created. Refreshing list.')
          mutate()
        }
      } else {
        toast.error(`Variant creation failed: ${res.message}`)
      }
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading candidate…</p>
      </div>
    )
  }

  // ── Error ──
  if (error || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm">Candidate not found or failed to load.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
        </Button>
      </div>
    )
  }

  const status = STATUS_MAP[candidate.status] ?? { label: candidate.status, variant: 'outline' as const }
  const hasBrief = !!candidate.aiBrief

  return (
    <div className="max-w-3xl space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 mt-0.5 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant={status.variant} className="capitalize">{status.label || 'Unknown'}</Badge>
            {candidate.tier && (() => {
               const tierStyles: Record<string, string> = {
                 viral:     'text-red-600 border-red-500/40 bg-red-500/5',
                 evergreen: 'text-green-600 border-green-500/40 bg-green-500/5',
                 niche:     'text-gray-500 border-gray-400/40 bg-gray-400/5',
               }
               return (
                 <Badge variant="outline" className={`capitalize ${tierStyles[candidate.tier!] ?? ''}`}>
                   {candidate.tier}
                 </Badge>
               )
            })()}
            {candidate.intent && (
              <Badge variant="outline" className="text-xs capitalize">{candidate.intent}</Badge>
            )}
            {candidate.evalMeta && (
               <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-muted-foreground cursor-pointer hover:bg-muted" onClick={() => setShowAuditLogDialog(true)}>
                 <Info className="h-3 w-3 mr-1" /> AI Audit Log
               </Button>
            )}
            {candidate.status !== 'ignored' && (
               <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-orange-500 cursor-pointer"
                onClick={() => handleAction('ignore')}
                disabled={!!actionLoading}
               >
                 <EyeOff className="h-3 w-3 mr-1" /> {actionLoading === 'ignore' ? 'Ignoring...' : 'Ignore'}
               </Button>
            )}
          </div>
          <div className="flex items-center gap-2 group">
            <h1 className="text-xl font-bold leading-snug">{candidate.title}</h1>
            <Button 
              variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setEditData({ title: candidate.title, priorityScore: candidate.priorityScore ?? 0 })}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Tag className="h-3.5 w-3.5" /> {candidate.mainKeyword}
          </p>
        </div>
      </div>

      {/* Action Card — only for generated or approved */}
      {(candidate.status === 'generated' || candidate.status === 'approved') && (
        <Card className={`border ${
          candidate.status === 'approved'
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-primary/30 bg-primary/5'
        }`}>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4">
            <div className="flex items-start gap-2">
              {candidate.status === 'approved'
                ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                : <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              }
              <p className="text-sm">
                {candidate.status === 'approved' && !hasBrief
                  ? '✏️ Approved. Create a Brief first, then Generate Article.'
                  : candidate.status === 'approved' && hasBrief
                  ? '✅ Brief ready. You can now generate the full article.'
                  : 'Review this candidate and approve or reject it.'}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap shrink-0">
              {/* Generate Article: only when approved + has brief */}
              {candidate.status === 'approved' && hasBrief && (
                <Button
                  className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 cursor-pointer"
                  disabled={!!actionLoading}
                  onClick={handleGenerateContent}
                >
                  {actionLoading === 'generate'
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Newspaper className="h-4 w-4" />}
                  {actionLoading === 'generate' ? 'Generating…' : 'Generate Article'}
                </Button>
              )}

              {/* Create Brief: when approved */}
              {candidate.status === 'approved' && (
                <Button
                  className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 cursor-pointer"
                  disabled={!!actionLoading}
                  onClick={handleGenerateBrief}
                >
                  {actionLoading === 'brief'
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Sparkles className="h-4 w-4" />}
                  {actionLoading === 'brief' ? 'Creating…' : (hasBrief ? 'Regenerate Brief' : 'Create Brief')}
                </Button>
              )}

              {/* Create Variant: when approved */}
              {candidate.status === 'approved' && (
                <Button
                  variant="outline"
                  className="gap-2 cursor-pointer"
                  disabled={!!actionLoading}
                  onClick={() => setShowVariantDialog(true)}
                >
                  <GitFork className="h-4 w-4" />
                  Create Variant
                </Button>
              )}

              {/* Approve: when generated */}
              {candidate.status === 'generated' && (
                <Button
                  className="gap-2 cursor-pointer"
                  disabled={!!actionLoading}
                  onClick={() => handleAction('approve')}
                >
                  {actionLoading === 'approve'
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <CheckCircle2 className="h-4 w-4" />}
                  {actionLoading === 'approve' ? 'Approving…' : 'Approve'}
                </Button>
              )}

              {/* Reject button */}
              {(candidate.status === 'generated' || candidate.status === 'approved') && (
                <Button
                  variant="destructive"
                  className="gap-2"
                  disabled={!!actionLoading}
                  onClick={() => handleAction('reject')}
                >
                  {actionLoading === 'reject'
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <XCircle className="h-4 w-4" />}
                  {actionLoading === 'reject' ? 'Rejecting…' : 'Reject'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={BarChart2}   label="AI Score"       value={candidate.aiScore}       color="text-primary" />
        <StatCard icon={TrendingUp}  label="Trend Score"    value={candidate.trendScore}     color="text-blue-500" />
        <StatCard 
          icon={Sparkles}    label="Priority Score" value={candidate.priorityScore !== undefined ? candidate.priorityScore?.toFixed(2) : null} color="text-amber-500" 
          onEdit={() => setEditData({ title: candidate.title, priorityScore: candidate.priorityScore ?? 0 })}
        />
        <StatCard icon={Search}      label="Search Volume"  value={candidate.searchVolume}   color="text-green-500" />
      </div>

      {/* Context Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cluster Keywords */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ListFilter className="h-3.5 w-3.5" /> Cluster Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            {loadingCluster ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading cluster...
              </div>
            ) : clusterKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {clusterKeywords.map((ck, idx) => (
                  <Badge key={ck.keyword || idx} variant="secondary" className="text-[10px] py-0 h-5">
                    {ck.keyword}
                    {ck.trendScore !== undefined && (
                      <span className="ml-1 opacity-60">({ck.trendScore})</span>
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-4">No cluster data.</p>
            )}
          </CardContent>
        </Card>

        {/* Source Items */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" /> Raw Sources (Top 50)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            {loadingRaw ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading sources...
              </div>
            ) : rawItems.length > 0 ? (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {rawItems.map((item, idx) => (
                  <div key={item.id || idx} className="text-[11px] leading-tight border-b pb-2 last:border-0 group">
                    <div className="flex items-start justify-between gap-2">
                       <p className="font-medium text-foreground/80 truncate flex-1">{item.title || '(No Title)'}</p>
                       {item.url && (
                         <a href={item.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                           <ExternalLink className="h-2.5 w-2.5" />
                         </a>
                       )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-[9px] h-4 px-1 leading-none">{item.source}</Badge>
                      <span>{item.publishDate ? new Date(item.publishDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-4">No source items.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Variants (siblings in same cluster) */}
      {variants.length > 0 && (
        <Card>
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <GitFork className="h-3.5 w-3.5" /> Cluster Variants ({variants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {variants.map(v => (
                <div key={v.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{v.title}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{v.intent || 'general'}</p>
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    className="h-6 px-2 text-[10px] gap-1"
                    onClick={() => router.push(`/dashboard/trendscout/topic-trends/${v.id}`)}
                  >
                    <ExternalLink className="h-3 w-3" /> View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keywords (Individual) */}
      {candidate.keywords?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-primary" /> Topic Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {candidate.keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Content */}
      <Card>
        <CardContent className="pt-5 space-y-5">
          {candidate.aiSummary && (
            <SectionBlock icon={BrainCircuit} title="AI Summary">
              <p className="text-sm leading-relaxed text-foreground/80">{candidate.aiSummary}</p>
            </SectionBlock>
          )}

          {candidate.aiSummary && (candidate.aiReason || hasBrief) && <Separator />}

          {candidate.aiReason && (
            <SectionBlock icon={Info} title="Target Audience">
              <p className="text-sm leading-relaxed text-foreground/80">{candidate.aiReason}</p>
            </SectionBlock>
          )}

          {hasBrief && (
            <>
              {candidate.aiReason && <Separator />}
              <SectionBlock icon={FileText} title="AI Brief">
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{candidate.aiBrief}</p>
              </SectionBlock>
            </>
          )}

          {!candidate.aiSummary && !candidate.aiReason && !hasBrief && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              No AI-generated content available yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 pt-1">
        <span>ID: <code className="font-mono">{candidate.id}</code></span>
        {candidate.clusterId && <span>Cluster: <code className="font-mono">{candidate.clusterId}</code></span>}
        <span>Created: {new Date(candidate.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        {candidate.updatedAt && <span>Updated: {new Date(candidate.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editData} onOpenChange={(open) => !open && setEditData(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" value={editData?.title || ''} 
                onChange={e => setEditData(prev => prev ? { ...prev, title: e.target.value } : null)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Score</Label>
              <Input 
                id="priority" type="number" step="0.1" 
                value={editData?.priorityScore || 0} 
                onChange={e => setEditData(prev => prev ? { ...prev, priorityScore: parseFloat(e.target.value) } : null)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditData(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={actionLoading === 'update'}>
              {actionLoading === 'update' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Variant Dialog */}
      <Dialog open={showVariantDialog} onOpenChange={(open) => { if (!open) { setShowVariantDialog(false); setSelectedIntent('') } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitFork className="h-4 w-4 text-primary" /> Create Variant
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Generate a new candidate from the same cluster with a different content angle.
            </p>
            <div className="space-y-2">
              <Label htmlFor="intent">Content Intent</Label>
              <Select value={selectedIntent} onValueChange={setSelectedIntent}>
                <SelectTrigger id="intent" className="w-full">
                  <SelectValue placeholder="Choose an intent…" />
                </SelectTrigger>
                <SelectContent>
                  {VARIANT_INTENTS.map(i => (
                    <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowVariantDialog(false); setSelectedIntent('') }}>Cancel</Button>
            <Button
              onClick={handleCreateVariant}
              disabled={!selectedIntent || actionLoading === 'variant'}
              className="gap-2"
            >
              {actionLoading === 'variant' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitFork className="h-4 w-4" />}
              {actionLoading === 'variant' ? 'Creating…' : 'Create Variant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={showAuditLogDialog} onOpenChange={setShowAuditLogDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <BrainCircuit className="h-4 w-4 text-primary" /> AI Audit Log
             </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             {candidate.evalMeta ? (
               <div className="space-y-3">
                 <div>
                   <span className="text-xs font-bold uppercase text-muted-foreground block mb-1">Prompt Version</span>
                   <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{candidate.evalMeta.prompt_version || 'N/A'}</code>
                 </div>
                 <div>
                   <span className="text-xs font-bold uppercase text-muted-foreground block mb-1">Logic Flags Triggered</span>
                   {candidate.evalMeta.logic_flags && candidate.evalMeta.logic_flags.length > 0 ? (
                     <div className="flex flex-wrap gap-1">
                       {candidate.evalMeta.logic_flags.map((flag: string, idx: number) => (
                         <Badge key={idx} variant="secondary" className="text-[10px] font-mono">{flag}</Badge>
                       ))}
                     </div>
                   ) : (
                     <p className="text-xs text-muted-foreground italic">No logic flags were thrown.</p>
                   )}
                 </div>
               </div>
             ) : (
                <p className="text-sm text-muted-foreground">No audit metadata available.</p>
             )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAuditLogDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
