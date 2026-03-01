'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, FileText, Database, Clock } from "lucide-react";
import { SummaryStats } from "@/services/ts-worker/types";

interface SummaryCardsProps {
  stats: SummaryStats | null;
  loading: boolean;
}

export function SummaryCards({ stats, loading }: SummaryCardsProps) {
  const cards = [
    {
      title: "Active Trends",
      value: stats?.counts.trends ?? 0,
      icon: TrendingUp,
      description: "Trends identified in the last 24h",
      color: "text-info",
      glow: "group-hover:shadow-[0_0_20px_-5px] group-hover:shadow-info/50",
    },
    {
      title: "Topic Candidates",
      value: stats?.counts.candidates ?? 0,
      icon: FileText,
      description: "Awaiting review",
      color: "text-primary",
      glow: "group-hover:shadow-[0_0_20px_-5px] group-hover:shadow-primary/50",
    },
    {
      title: "Raw Items",
      value: stats?.counts.totalItemsIngested ?? 0,
      icon: Database,
      description: "Total items processed",
      color: "text-success",
      glow: "group-hover:shadow-[0_0_20px_-5px] group-hover:shadow-success/50",
    },
    {
      title: "NLP Backlog",
      value: stats?.queue.nlpBacklog ?? 0,
      icon: Clock,
      description: "Items pending processing",
      color: "text-warning",
      glow: "group-hover:shadow-[0_0_20px_-5px] group-hover:shadow-warning/50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className={`relative overflow-hidden group transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm ${card.glow}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-muted/50 ${card.color}`}>
               <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight">
                    {card.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {card.description}
                </p>
              </>
            )}
          </CardContent>
          
          {/* Subtle bottom border highlight */}
          <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 transition-all duration-500 group-hover:w-full ${card.color}`} />
        </Card>
      ))}
    </div>
  );
}
