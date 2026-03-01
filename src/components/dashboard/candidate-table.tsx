'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopicCandidate } from "@/services/ts-worker/types";
import { Check, X, Eye, TrendingUp } from "lucide-react";

interface CandidateTableProps {
  candidates: TopicCandidate[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (candidate: TopicCandidate) => void;
}

export function CandidateTable({
  candidates,
  loading,
  onApprove,
  onReject,
  onView,
}: CandidateTableProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="w-[100px]">Score</TableHead>
            <TableHead>Topic Title</TableHead>
            <TableHead>Main Keyword</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-5 w-12 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-5 w-48 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-5 w-24 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-5 w-16 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-8 w-24 ml-auto bg-muted animate-pulse rounded" /></TableCell>
              </TableRow>
            ))
          ) : candidates.length > 0 ? (
            candidates.map((candidate) => (
              <TableRow key={candidate.id} className="group hover:bg-muted/30 transition-colors border-border/50">
                <TableCell>
                  <div className="flex items-center gap-1 font-medium text-success">
                    <TrendingUp className="h-3 w-3" />
                    {candidate.score.toFixed(1)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{candidate.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-muted/50 font-mono text-[10px] tracking-tight uppercase">
                    {candidate.mainKeyword}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={
                      candidate.status === 'approved' ? 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_-2px] shadow-success/20' :
                      candidate.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      'bg-info/10 text-info border-info/20 shadow-[0_0_10px_-2px] shadow-info/20'
                    }
                  >
                    {candidate.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => onView(candidate)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {candidate.status === 'generated' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-success hover:bg-success/10"
                          onClick={() => onApprove(candidate.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onReject(candidate.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                No candidates found for the selected filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
