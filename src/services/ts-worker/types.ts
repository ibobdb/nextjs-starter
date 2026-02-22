export interface JobStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

export interface DatasourceLog {
  id: string;
  datasource: string;
  successCount: number;
  failCount: number;
  runtime: number; // in milliseconds
  timestamp: string;
}

export interface TrendKeyword {
  keyword: string;
  volume: number;
  source: string[];
}

export interface TopicCandidate {
  id: string;
  title: string;
  mainKeyword: string;
  score: number;
  status: 'generated' | 'approved' | 'rejected';
  aiSummary?: string;
  aiBrief?: string;
  aiReason?: string;
  intent?: string;
  keywords: string[];
  createdAt: string;
}

export interface ClusteringRequest {
  category?: string;
  keyword?: string;
  lookbackDays?: number;
  callbackUrl?: string;
}

export interface ClusteringProcess {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  category?: string;
  keyword?: string;
  resultsCount?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SummaryStats {
  counts: {
    trends: number;
    candidates: number;
    clusters: number;
    totalItemsIngested: number;
  };
  queue: {
    nlpBacklog: number;
    pendingEvaluations: number;
    activeBackgroundJobs: number;
  };
  systemStatus: string;
  timestamp: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface KeywordTrend {
  keyword: string;
  score: number;
  popularityScore?: number;
}

export interface DataSource {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastRun?: string;
  lastStatus?: 'SUCCESS' | 'FAILED';
}

export interface DataSourceRun {
  id: string;
  status: 'SUCCESS' | 'FAILED';
  itemsCreated: number;
  startTime: string;
  endTime?: string;
}

export interface SystemConfig {
  [key: string]: string;
}

export interface PublishedData {
  candidateId: string;
  url: string;
  title: string;
  publishDate: string;
}

export interface ContentMetrics {
  url: string;
  date: string;
  views?: number;
  conversions?: number;
}

export interface WorkerHealth {
  status: string;
  database: string;
  uptime: number;
  timezone: string;
}

export interface GrowthSummary {
  sourceId: number;
  source: {
    name: string;
  };
  _sum: {
    itemsCreated: number;
  };
  _count: {
    id: number;
  };
}

export interface GrowthMetricsData {
  summary: GrowthSummary[];
}
