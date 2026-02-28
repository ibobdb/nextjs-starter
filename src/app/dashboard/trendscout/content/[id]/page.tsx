"use client"

import { use } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { draftsApi } from "@/services/ts-worker/api/drafts"
import { topicsApi } from "@/services/ts-worker/api/topics"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { DataLoader } from "@/components/ui/data-loader"
import {
  FileText,
  Search,
  UploadCloud,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Copy,
} from "lucide-react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"

export default function DraftEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const { data: draftRes, mutate: mutateDraft, isLoading: isDraftLoading } = useSWR(
    `ts-worker/drafts/${id}`,
    () => draftsApi.getDraft(id),
    { revalidateOnFocus: false }
  )
  const draft = draftRes?.data

  const { data: candidateRes } = useSWR(
    draft?.candidateId ? `ts-worker/topics/candidates/${draft.candidateId}` : null,
    () => topicsApi.getCandidate(draft!.candidateId)
  )
  const candidate = candidateRes?.data

  const handleSeoAudit = async () => {
    toast.info("Running SEO Audit...")
    try {
      const res = await draftsApi.runSeoAudit(id)
      if (res.success) {
        toast.success("SEO Audit completed!")
        mutateDraft()
      } else {
        toast.error(`Audit failed: ${res.message}`)
      }
    } catch {
      toast.error("Audit failed")
    }
  }

  const handlePublish = async () => {
    toast.info("Publishing to CMS...")
    try {
      const res = await draftsApi.publishDraft(id)
      if (res.success) {
        toast.success("Draft published successfully!")
        router.push("/dashboard/trendscout/content")
      } else {
        toast.error(`Publish failed: ${res.message}`)
      }
    } catch {
      toast.error("Publish failed")
    }
  }

  const getSeoBarColor = (score: number | null) => {
    if (!score) return "bg-muted";
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-400";
    return "bg-red-500";
  }

  const getSeoTextColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-500";
  }

  if (isDraftLoading) {
    return <div className="flex justify-center p-20"><DataLoader variant="card" /></div>
  }

  if (!draft) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-bold">Draft not found</h2>
        <Button onClick={() => router.back()} className="mt-4 gap-2" variant="outline"><ArrowLeft className="h-4 w-4" /> Go Back</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 pb-4">
      {/* Top Navigation & Status */}
      <div className="flex items-center justify-between shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 py-2 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/trendscout/content")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              {draft.metaTitle || "Untitled Draft"}
              {draft.status === 'sent_to_cms' && <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>}
              {draft.status === 'draft' && <Badge variant="secondary">Draft</Badge>}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Draft ID: {draft.id} | Slug: /{draft.slug || 'pending'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {/* SEO Score Progress Bar */}
           <div className="flex items-center gap-3 mr-2">
             <div className="text-right">
               <span className={`text-xs font-bold tabular-nums ${getSeoTextColor(draft.seoScore)}`}>
                 {draft.seoScore !== null ? `${draft.seoScore}/100` : 'No Score'}
               </span>
               <p className="text-[10px] text-muted-foreground">SEO Score</p>
             </div>
             <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
               <div 
                 className={`h-full rounded-full transition-all ${getSeoBarColor(draft.seoScore)}`}
                 style={{ width: `${draft.seoScore ?? 0}%` }}
               />
             </div>
           </div>
          
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={handleSeoAudit}
            disabled={draft.status === 'sent_to_cms'}
          >
            <Search className="h-4 w-4" />
            Run SEO Audit
          </Button>
          
          <Button 
            className="gap-2" 
            onClick={handlePublish}
            disabled={draft.status === 'sent_to_cms'}
          >
            <UploadCloud className="h-4 w-4" />
            Send to CMS
          </Button>
        </div>
      </div>

      <div className="flex gap-6 h-full min-h-0">
        {/* Left Column: Brief & Strategy */}
        <div className="w-[380px] shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
          <Card className="border-orange-500/20 bg-orange-500/5">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                Editorial Strategy
              </h3>
              
              {!candidate ? (
                <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Loading source candidate...</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-muted-foreground">Original Title</span>
                    <p className="font-medium text-sm">{candidate.title}</p>
                  </div>
                  
                  {candidate.aiSummary && (
                    <div>
                      <span className="text-xs font-bold uppercase text-muted-foreground">Why this trends</span>
                      <p className="text-sm">{candidate.aiSummary}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-bold uppercase text-muted-foreground block mb-1">Target Keywords</span>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="default" className="text-[10px]">{candidate.mainKeyword}</Badge>
                      {candidate.keywords.map(k => (
                        <Badge key={k} variant="secondary" className="text-[10px]">{k}</Badge>
                      ))}
                    </div>
                  </div>

                  {candidate.aiBrief && (
                    <div>
                      <span className="text-xs font-bold uppercase text-muted-foreground block mb-2">Content Brief</span>
                      <div className="text-xs prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1">
                        <ReactMarkdown>{candidate.aiBrief}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Metadata Box */}
          <Card>
            <CardContent className="p-4 space-y-4">
               <h3 className="font-semibold text-sm flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Generated SEO Metadata
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground">Meta Title</span>
                  <p className="text-sm font-medium">{draft.metaTitle || '—'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground">Meta Description</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{draft.metaDescription || '—'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground">URL Slug</span>
                  <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono break-all">{draft.slug || '—'}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Markdown Editor & Preview Base */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/10 rounded-xl overflow-hidden border">
           <div className="bg-muted/40 p-2 flex items-center justify-between border-b">
              <span className="text-xs font-bold uppercase text-muted-foreground ml-2 flex items-center gap-2">
                 <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                 Generated Article Content
              </span>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={() => {
                navigator.clipboard.writeText(draft.content || '')
                toast.success('Copied to clipboard!')
              }}>
                <Copy className="h-3 w-3" /> Copy
              </Button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
             {draft.content || 'Draft content empty.'}
           </div>
        </div>
      </div>
    </div>
  )
}
