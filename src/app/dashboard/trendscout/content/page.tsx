"use client"

import { useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { draftsApi } from "@/services/ts-worker/api/drafts"
import { ArticleDraft } from "@/services/ts-worker/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DataLoader } from "@/components/ui/data-loader"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Newspaper,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  FileText,
  Trash2,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"

const fetchDrafts = (page: number, limit: number, status: string): Promise<{ items: ArticleDraft[], totalPages: number, total: number }> =>
  draftsApi.getDrafts({ page, limit, status }).then(res => {
    type DraftsPayload = { items?: ArticleDraft[]; metadata?: { totalPages?: number; total?: number } };
    const payload = res.data as DraftsPayload;
    
    // Extract array from payload.items
    const items = Array.isArray(payload?.items)
      ? payload.items
      : (Array.isArray(res.data) ? (res.data as ArticleDraft[]) : []);
      
    // Extract metadata
    const meta = payload?.metadata || res.meta;

    return {
      items,
      totalPages: meta?.totalPages ?? (Math.ceil((meta?.total ?? 0) / limit) || 1),
      total: meta?.total ?? items.length,
    }
  }).catch(() => ({ items: [], totalPages: 1, total: 0 }))

export default function ContentLibraryPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<"draft" | "sent_to_cms">("draft")
  const LIMIT = 10

  const { data, isLoading, mutate, isValidating } = useSWR(
    ['ts-worker/drafts', page, status],
    () => fetchDrafts(page, LIMIT, status),
    { revalidateOnFocus: false, keepPreviousData: true }
  )

  const items = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      await draftsApi.deleteDraft(id)
      toast.success("Draft deleted")
      mutate()
    } catch {
      toast.error("Failed to delete draft")
    }
  }

  const getSeoColor = (score: number | null) => {
    if (!score) return "bg-muted text-muted-foreground";
    if (score >= 80) return "bg-green-500/10 text-green-600";
    if (score >= 50) return "bg-yellow-500/10 text-yellow-600";
    return "bg-red-500/10 text-red-600";
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Content Library</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Manage your AI-generated article drafts, perform SEO audits, and publish to your CMS.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Tabs value={status} onValueChange={(v: string) => { setStatus(v as 'draft' | 'sent_to_cms'); setPage(1); }} className="w-[400px]">
            <TabsList>
              <TabsTrigger value="draft" className="gap-2"><FileText className="h-4 w-4" /> Drafts</TabsTrigger>
              <TabsTrigger value="sent_to_cms" className="gap-2"><ExternalLink className="h-4 w-4" /> Published</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => mutate()} disabled={isValidating}>
            <RefreshCw className={`h-3 w-3 ${isValidating ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <Card>
          {isLoading && items.length === 0 ? (
            <CardContent className="pt-6">
              <DataLoader variant="table" rows={5} />
            </CardContent>
          ) : items.length === 0 ? (
            <CardContent className="py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No {status === 'draft' ? 'drafts' : 'published articles'} found.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {status === 'draft' ? 'Generate content from topic candidates to see them here.' : 'No drafts have been sent to the CMS yet.'}
              </p>
            </CardContent>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-wide">Title / Slug</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wide">Candidate ID</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wide">SEO Score</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wide">
                      <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Updated At</div>
                    </TableHead>
                    <TableHead className="text-right pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/10 cursor-pointer" onClick={() => router.push(`/dashboard/trendscout/content/${item.id}`)}>
                      <TableCell className="pl-6 font-medium text-sm max-w-[300px]">
                        <div className="truncate text-foreground font-semibold">
                          {item.metaTitle || 'Untitled Draft'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5 font-mono bg-muted/50 px-1 py-0.5 rounded w-fit">
                          {item.slug ? `/${item.slug}` : 'No slug generated'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {item.candidateId}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${getSeoColor(item.seoScore)} font-bold tabular-nums`}>
                          {item.seoScore ? `${item.seoScore}/100` : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t">
                  <span className="text-xs text-muted-foreground">Page {page} of {totalPages} (Total: {total})</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" className="h-7 w-7"
                      onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-7 w-7"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </section>
    </div>
  )
}
