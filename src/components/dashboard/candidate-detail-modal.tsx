'use client';

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopicCandidate } from "@/services/ts-worker/types";
import { Sparkles, BarChart3, Target, Check, Calendar, Quote } from "lucide-react";

interface CandidateDetailModalProps {
  candidate: TopicCandidate | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
}

export function CandidateDetailModal({
  candidate,
  isOpen,
  onClose,
  onApprove,
}: CandidateDetailModalProps) {
  if (!candidate) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto flex flex-col p-0 gap-0 border-l border-border/50 bg-background/95 backdrop-blur-md">
        <SheetHeader className="p-8 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)]">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-wider text-[10px] font-bold">AI Intelligence</Badge>
            </div>
            <Badge variant="outline" className="uppercase tracking-wider text-[10px] font-bold border-border/50">
                {candidate.status}
            </Badge>
          </div>
          <SheetTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent italic">
            {candidate.title}
          </SheetTitle>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{candidate.intent || 'Discovery'}</span>
            </span>
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Score: {candidate.score.toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'N/A'}</span>
            </span>
          </div>
        </SheetHeader>

        <div className="flex-1 p-8 space-y-10">
          {/* Summary Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Executive Summary</h3>
            </div>
            <p className="text-lg text-foreground/90 leading-relaxed font-medium">
              {candidate.aiSummary || "No summary available."}
            </p>
          </section>

          {/* Reason Section */}
          <section className="bg-primary/5 p-6 rounded-2xl border border-primary/10 relative overflow-hidden group shadow-inner">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-500">
                <Quote className="h-12 w-12" />
            </div>
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Strategy & Context</h3>
            <p className="text-base text-foreground/80 leading-relaxed italic relative z-10">
              &quot;{candidate.aiReason || "This topic was selected based on high growth potential and relevance to your target audience."}&quot;
            </p>
          </section>

          {/* Full Brief Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Content Roadmap</h3>
            </div>
            <div className="bg-muted/30 p-8 rounded-2xl border border-border/50 shadow-inner">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-sans text-base leading-relaxed text-foreground/90 space-y-4">
                  {candidate.aiBrief || "The full content brief is being generated. It will include target audience, key points to cover, and suggested distribution channels."}
                </div>
              </div>
            </div>
          </section>
          
          {/* Keywords Section */}
          <section className="pt-6 border-t border-border/50">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Semantic Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.keywords?.length > 0 ? candidate.keywords.map((kw, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1 bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all font-mono text-[11px] rounded-md border border-border/50 hover:border-primary/20">
                  {kw}
                </Badge>
              )) : (
                <Badge variant="outline" className="text-muted-foreground border-dashed">{candidate.mainKeyword}</Badge>
              )}
            </div>
          </section>
        </div>

        <SheetFooter className="p-6 border-t border-border/50 bg-muted/20 sticky bottom-0 backdrop-blur-sm">
          <div className="flex items-center justify-between w-full gap-4">
              <Button variant="ghost" onClick={onClose} className="hover:bg-background">Dismiss</Button>
              {candidate.status === 'generated' && onApprove ? (
                <Button 
                    onClick={() => { onApprove(candidate.id); onClose(); }} 
                    className="gap-2 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
                >
                  <Check className="h-4 w-4" />
                  Approve Topic & Start Plan
                </Button>
              ) : (
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 px-4 py-2 gap-2 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]">
                  <Check className="h-4 w-4" />
                  {candidate.status === 'approved' ? 'Successfully Approved' : 'Topic Rejected'}
                </Badge>
              )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
